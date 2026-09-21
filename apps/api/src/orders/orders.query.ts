import { OrderStatus, Permission } from "@ecommand/shared";
import { ConflictException, Injectable } from "@nestjs/common";
import { orderStatusHistory, orders } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { DrizzleService } from "@/database/drizzle.service";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { UserId } from "@/users/users.types";
import type { OrderId, OrderInsert, OrderUpdate } from "./orders.types";
import { OrderListQueryDto } from "./requests/order-list-query.dto";

type OrdersColumns = QueryColumns<"orders">;
type OrdersRelations = QueryRelations<"orders">;

const orderListColumns = {
	id: true,
	orderNumber: true,
	quantityDemanded: true,
	quantityAchieved: true,
	orderDate: true,
	startDate: true,
	endDate: true,
	createdAt: true,
} satisfies OrdersColumns;

const orderBaseRelations = {
	createdByUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
	orderStatus: {
		columns: {
			id: true,
			name: true,
		},
	},
	customer: {
		columns: {
			id: true,
			companyName: true,
		},
	},
	good: {
		columns: {
			id: true,
			name: true,
		},
	},
	unit: {
		columns: {
			name: true,
		},
	},
} satisfies OrdersRelations;

const orderDetailRelations = {
	...orderBaseRelations,
	claims: true,
	forecastPrograms: true,
	orderStatusHistories: true,
	orderExecutions: true,
	orderFiles: {
		where: { deletedAt: { isNull: true } },
		columns: {
			id: true,
			orderId: true,
			fileName: true,
			description: true,
			uploadedByUserId: true,
			uploadedAt: true,
		},
		with: {
			attachment: {
				columns: {
					fileSize: true,
					mimeType: true,
				},
			},
		},
	},
} satisfies OrdersRelations;

@Injectable()
export class OrdersQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createOrder(values: OrderInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(orders).values(values).returning({
					id: orders.id,
				}),
			values,
		);
		return created;
	}

	async findOrders(user: AuthUser, query: OrderListQueryDto) {
		const {
			search,
			status,
			goodsId,
			customerId,
			movementTypeId,
			startDate,
			endDate,
			page,
			limit,
		} = query;

		return this.drizzle.db.query.orders.findMany({
			where: {
				...(!hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)
					? { createdByUserId: user.id }
					: {}),

				...(status ? { status } : {}),
				...(goodsId ? { goodsId } : {}),
				...(customerId ? { customerId } : {}),
				...(movementTypeId ? { movementTypeId } : {}),

				...(startDate
					? {
							startDate: {
								gte: startDate,
							},
						}
					: {}),

				...(endDate
					? {
							endDate: {
								lte: endDate,
							},
						}
					: {}),

				...(search
					? {
							OR: [
								{
									orderNumber: {
										ilike: `%${search}%`,
									},
								},
								{
									supervisor: {
										ilike: `%${search}%`,
									},
								},
								{
									customer: {
										companyName: {
											ilike: `%${search}%`,
										},
									},
								},
								{
									orderStatus: {
										name: {
											ilike: `%${search}%`,
										},
									},
								},
							],
						}
					: {}),
			},
			columns: orderListColumns,
			with: orderBaseRelations,
			limit,
			offset: (page - 1) * limit,
		});
	}

	async findOrder(id: OrderId) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id },
			with: orderDetailRelations,
		});
	}

	async findOrderForOwnership(id: OrderId) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				createdByUserId: true,
			},
		});
	}

	async findOrderForAccess(id: OrderId) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				id: true,
				customerId: true,
				createdByUserId: true,
			},
		});
	}

	async findEligibleOrdersForPrograms(user: AuthUser, query: ListQueryDto) {
		return this.drizzle.db.query.orders.findMany({
			where: {
				orderStatus: {
					name: {
						in: [
							OrderStatus.APPROVED,
							OrderStatus.SENT_TO_DTM,
							OrderStatus.IN_PROGRESS,
						],
					},
				},
				...(hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)
					? {}
					: {
							createdByUserId: user.id,
						}),
				...(query.search
					? {
							orderNumber: {
								ilike: `%${query.search}%`,
							},
						}
					: {}),
			},
			columns: {
				id: true,
				orderNumber: true,
				quantityDemanded: true,
			},
			orderBy: {
				orderDate: "desc",
				id: "desc",
			},
			limit: query.limit,
			offset: (query.page - 1) * query.limit,
		});
	}

	async findOrderStatus(id: OrderId) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});
	}

	async updateOrder(
		id: OrderId,
		values: OrderUpdate,
		options: {
			where?: SQL;
			history: {
				userId: UserId;
				comment?: string;
			};
		},
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const previous =
				values.statusId !== undefined
					? await this.findOrderStatusInternal(tx, id)
					: undefined;

			const [updated] = await withDbErrorHandling(
				() =>
					tx
						.update(orders)
						.set(values)
						.where(options.where ?? eq(orders.id, id))
						.returning({
							id: orders.id,
						}),
				values,
			);

			if (!updated) {
				throw new ConflictException(
					`Order ${id} was modified or does not exist`,
				);
			}

			if (
				previous &&
				values.statusId !== undefined &&
				values.statusId !== previous.statusId
			) {
				await this.recordOrderStatusInternal(tx, {
					orderId: id,
					statusId: values.statusId,
					userId: options.history.userId,
					comment: options.history.comment,
				});
			}

			return updated;
		});
	}

	private async findOrderStatusInternal(tx: DrizzleDb, id: OrderId) {
		return tx.query.orders.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});
	}

	private async recordOrderStatusInternal(
		tx: DrizzleDb,
		data: {
			orderId: OrderId;
			statusId: string;
			userId: UserId;
			comment?: string;
		},
	) {
		return withDbErrorHandling(
			() =>
				tx.insert(orderStatusHistory).values({
					orderId: data.orderId,
					statusId: data.statusId,
					changedById: data.userId,
					comment: data.comment ?? null,
				}),
			data,
		);
	}

	async deleteOrder(id: OrderId) {
		const [deleted] = await this.drizzle.db
			.delete(orders)
			.where(eq(orders.id, id))
			.returning({
				id: orders.id,
			});
		return deleted;
	}
}
