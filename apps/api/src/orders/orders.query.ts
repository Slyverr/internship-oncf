import { OrderStatus, Permission } from "@ecommand/shared";
import { ConflictException } from "@nestjs/common";
import { orderStatusHistory, orders } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { ListQueryDto } from "@/common/requests/list-query.dto";
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
	orderFiles: true,
} satisfies OrdersRelations;

export async function createOrder(db: DrizzleDb, values: OrderInsert) {
	const [created] = await withDbErrorHandling(
		() =>
			db.insert(orders).values(values).returning({
				id: orders.id,
			}),
		values,
	);

	return created;
}

export async function findOrders(
	db: DrizzleDb,
	user: AuthUser,
	query: OrderListQueryDto,
) {
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

	return db.query.orders.findMany({
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

export async function findOrder(db: DrizzleDb, id: OrderId) {
	return db.query.orders.findFirst({
		where: { id },
		with: orderDetailRelations,
	});
}

export async function findOrderForOwnership(db: DrizzleDb, id: OrderId) {
	return db.query.orders.findFirst({
		where: { id },
		columns: {
			createdByUserId: true,
		},
	});
}

export async function findOrderForAccess(db: DrizzleDb, id: OrderId) {
	return db.query.orders.findFirst({
		where: { id },
		columns: {
			id: true,
			customerId: true,
			createdByUserId: true,
		},
	});
}

export async function findEligibleOrdersForPrograms(
	db: DrizzleDb,
	user: AuthUser,
	query: ListQueryDto,
) {
	return db.query.orders.findMany({
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

export async function findOrderStatus(db: DrizzleDb, id: OrderId) {
	return db.query.orders.findFirst({
		where: { id },
		columns: {
			statusId: true,
		},
	});
}

export async function updateOrder(
	db: DrizzleDb,
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
	return db.transaction(async (tx) => {
		const previous =
			values.statusId !== undefined ? await findOrderStatus(tx, id) : undefined;

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
			throw new ConflictException(`Order ${id} was modified or does not exist`);
		}

		if (
			previous &&
			values.statusId !== undefined &&
			values.statusId !== previous.statusId
		) {
			await recordOrderStatus(tx, {
				orderId: id,
				statusId: values.statusId,
				userId: options.history.userId,
				comment: options.history.comment,
			});
		}

		return updated;
	});
}

export async function recordOrderStatus(
	db: DrizzleDb,
	data: {
		orderId: OrderId;
		statusId: string;
		userId: UserId;
		comment?: string;
	},
) {
	return withDbErrorHandling(
		() =>
			db.insert(orderStatusHistory).values({
				orderId: data.orderId,
				statusId: data.statusId,
				changedById: data.userId,
				comment: data.comment ?? null,
			}),
		data,
	);
}

export async function deleteOrder(db: DrizzleDb, id: OrderId) {
	const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning({
		id: orders.id,
	});

	return deleted;
}
