import { API_ERROR_CODES, OrderStatus, Permission } from "@ecommand/shared";
import { ConflictException, Injectable } from "@nestjs/common";
import { notifications, orderStatusHistory, orders } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { DrizzleService } from "@/database/drizzle.service";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";

import { DTM_REQUEST_TYPES } from "@/database/reference-data";
import type { NotificationInsert } from "@/notifications/notifications.types";
import type { UserId } from "@/users/users.types";
import type { OrderId, OrderInsert, OrderUpdate } from "./orders.types";
import { OrderListQueryDto } from "./requests/order-list-query.dto";

type OrdersColumns = QueryColumns<"orders">;
type OrdersRelations = QueryRelations<"orders">;

function getDtmResponseStatus(payload: string | null | undefined) {
	if (!payload) return null;
	try {
		const parsed: unknown = JSON.parse(payload);
		if (
			typeof parsed !== "object" ||
			parsed === null ||
			!("status" in parsed)
		) {
			return null;
		}
		const status = parsed.status;
		return typeof status === "string" ? status : null;
	} catch {
		return null;
	}
}

const orderSortColumns = [
	"orderNumber",
	"quantityDemanded",
	"orderDate",
	"createdAt",
] as const;

function getSearchDateRange(search: string) {
	const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(search.trim());
	if (!match) return null;

	const year = Number(match[1]);
	const month = match[2] ? Number(match[2]) : 1;
	const day = match[3] ? Number(match[3]) : 1;
	if (year < 1000 || year > 9998 || month < 1 || month > 12) return null;

	const start = new Date(Date.UTC(year, month - 1, day));
	if (
		start.getUTCFullYear() !== year ||
		start.getUTCMonth() !== month - 1 ||
		start.getUTCDate() !== day
	) {
		return null;
	}

	const end = match[3]
		? new Date(Date.UTC(year, month - 1, day + 1))
		: match[2]
			? new Date(Date.UTC(year, month, 1))
			: new Date(Date.UTC(year + 1, 0, 1));
	return { start: start.toISOString(), end: end.toISOString() };
}

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
		const [created] = await this.drizzle.db
			.insert(orders)
			.values(values)
			.returning({
				id: orders.id,
			});
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
			hasAssignedWagons,
			page,
			limit,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = query;
		const searchDateRange = search ? getSearchDateRange(search) : null;
		const customerScope = getCustomerScope(user);
		const managesOther = hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER);
		const scopedCustomerIds =
			customerScope === null
				? null
				: customerId !== undefined
					? customerScope.includes(customerId)
						? [customerId]
						: []
					: [...customerScope];

		return this.drizzle.db.query.orders.findMany({
			where: {
				...(scopedCustomerIds !== null
					? {
							customerId:
								scopedCustomerIds.length === 1
									? scopedCustomerIds[0]
									: { in: scopedCustomerIds },
						}
					: managesOther
						? customerId !== undefined
							? { customerId }
							: {}
						: { createdByUserId: user.id }),

				...(status
					? {
							orderStatus: {
								name: status,
							},
						}
					: {}),
				...(goodsId ? { goodsId } : {}),
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

				...(hasAssignedWagons ? { orderWagons: true } : {}),

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
									customer: {
										customerCode: {
											ilike: `%${search}%`,
										},
									},
								},
								{
									good: {
										name: {
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
								...(searchDateRange
									? [
											{
												orderDate: {
													gte: searchDateRange.start,
													lt: searchDateRange.end,
												},
											},
											{
												startDate: {
													gte: searchDateRange.start,
													lt: searchDateRange.end,
												},
											},
											{
												endDate: {
													gte: searchDateRange.start,
													lt: searchDateRange.end,
												},
											},
											{
												createdAt: {
													gte: searchDateRange.start,
													lt: searchDateRange.end,
												},
											},
										]
									: []),
							],
						}
					: {}),
			},
			columns: orderListColumns,
			with: orderBaseRelations,
			orderBy: {
				[orderSortColumns.includes(sortBy as (typeof orderSortColumns)[number])
					? sortBy
					: "createdAt"]: sortOrder,
				id: "desc",
			},
			limit,
			offset: (page - 1) * limit,
		});
	}

	async findOrder(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			with: orderDetailRelations,
		});
		if (!order) return undefined;

		const dtmRequest = await this.drizzle.db.query.dtmIntegrationLog.findFirst({
			where: {
				relatedEntityType: "orders",
				relatedEntityId: id,
				requestTypeId: DTM_REQUEST_TYPES.SEND_ORDER.id,
			},
			columns: {
				status: true,
				responsePayload: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc", id: "desc" },
		});

		return {
			...order,
			dtmRequestStatus: dtmRequest?.status ?? null,
			dtmResponseStatus: getDtmResponseStatus(dtmRequest?.responsePayload),
			dtmSubmittedAt: dtmRequest?.createdAt ?? null,
		};
	}

	async findOrderIdByNumber(orderNumber: string) {
		return this.drizzle.db.query.orders.findFirst({
			where: { orderNumber },
			columns: { id: true },
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

	async findOrderForOwnershipByNumber(orderNumber: string) {
		return this.drizzle.db.query.orders.findFirst({
			where: { orderNumber },
			columns: { createdByUserId: true },
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

	async findOrderForAccessByNumber(orderNumber: string) {
		return this.drizzle.db.query.orders.findFirst({
			where: { orderNumber },
			columns: {
				id: true,
				customerId: true,
				createdByUserId: true,
			},
		});
	}

	async findEligibleOrdersForPrograms(user: AuthUser, query: ListQueryDto) {
		const customerScope = getCustomerScope(user);
		const managesOther = hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER);

		return this.drizzle.db.query.orders.findMany({
			where: {
				forecastPrograms: false,
				orderStatus: {
					name: {
						in: [
							OrderStatus.APPROVED,
							OrderStatus.SENT_TO_DTM,
							OrderStatus.IN_PROGRESS,
						],
					},
				},
				...(customerScope !== null
					? {
							customerId:
								customerScope.length === 1
									? customerScope[0]
									: { in: [...customerScope] },
						}
					: managesOther
						? {}
						: { createdByUserId: user.id }),
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
				orderNumber: true,
				createdByUserId: true,
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
			notification?: NotificationInsert;
		},
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const previous =
				values.statusId !== undefined
					? await this.findOrderStatusInternal(tx, id)
					: undefined;

			const [updated] = await tx
				.update(orders)
				.set(values)
				.where(options.where ?? eq(orders.id, id))
				.returning({
					id: orders.id,
				});

			if (!updated) {
				throw new ConflictException({
					code: API_ERROR_CODES.ORDER_UPDATE_CONFLICT,
				});
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
				if (options.notification) {
					const notification = options.notification;
					await tx.insert(notifications).values(notification);
				}
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
		return tx.insert(orderStatusHistory).values({
			orderId: data.orderId,
			statusId: data.statusId,
			changedById: data.userId,
			comment: data.comment ?? null,
		});
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
