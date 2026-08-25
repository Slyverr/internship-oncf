import { OrderStatus, Permission } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orderStatusHistory, orders } from "drizzle/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { ListQueryDto } from "src/common/requests/list-query.dto";
import { DrizzleService } from "src/database/drizzle.service";
import { DrizzleDb } from "src/database/drizzle.types";
import { withDbErrorHandling } from "src/database/drizzle.util";
import { ORDER_STATUSES } from "src/database/reference-data";
import { UserId } from "src/users/users.types";
import { ORDER_STATUS_BY_ID, ORDER_TRANSITION } from "./orders.constants";
import { toCreate, toUpdate } from "./orders.mapper";
import {
	buildEligibleProgramOrdersQuery,
	orderDetailRelations,
	orderListColumns,
	orderListRelations,
} from "./orders.query";
import type { OrderId, OrderUpdate } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

@Injectable()
export class OrdersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateOrderDto, user: AuthUser) {
		const values = toCreate(dto, user);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(orders)
					.values(values)
					.returning({ id: orders.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		const where = !hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)
			? { createdByUserId: user.id }
			: {};

		return this.drizzle.db.query.orders.findMany({
			where,
			columns: orderListColumns,
			with: orderListRelations,
		});
	}

	async findEligibleForPrograms(user: AuthUser, query: ListQueryDto) {
		return this.drizzle.db.query.orders.findMany(
			buildEligibleProgramOrdersQuery(user, query),
		);
	}

	async findOne(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			with: orderDetailRelations,
		});

		return this.ensure(order, id);
	}

	async findOneForOwnership(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: { createdByUserId: true },
		});

		return this.ensure(order, id);
	}

	async findOneForAccess(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				id: true,
				customerId: true,
				createdByUserId: true,
			},
		});

		return this.ensure(order, id);
	}

	async update(id: OrderId, dto: UpdateOrderDto, user: AuthUser) {
		await this.persistUpdate(this.drizzle.db, id, toUpdate(dto, user), {
			history: {
				userId: user.id,
			},
		});

		return this.findOne(id);
	}

	async submit(id: OrderId, user: AuthUser) {
		return this.transition(id, user, OrderStatus.SUBMITTED);
	}

	async approve(id: OrderId, user: AuthUser) {
		return this.transition(id, user, OrderStatus.APPROVED);
	}

	async reject(id: OrderId, reason: string, user: AuthUser) {
		return this.transition(id, user, OrderStatus.REJECTED, reason);
	}

	async cancel(id: OrderId, user: AuthUser) {
		return this.transition(id, user, OrderStatus.CANCELLED);
	}

	async sendToDtm(id: OrderId, user: AuthUser) {
		return this.transition(id, user, OrderStatus.SENT_TO_DTM);
	}

	async remove(id: OrderId) {
		const [deleted] = await this.drizzle.db
			.delete(orders)
			.where(eq(orders.id, id))
			.returning({ id: orders.id });

		if (!deleted) {
			throw new NotFoundException(`Order ${id} not found`);
		}

		return deleted;
	}

	private ensure<T>(order: T | undefined, id: OrderId) {
		if (!order) throw new NotFoundException(`Order ${id} not found`);
		return order;
	}

	private async persistUpdate(
		db: DrizzleDb,
		id: OrderId,
		values: OrderUpdate,
		options?: {
			where?: SQL;
			history?: {
				userId: UserId;
				comment?: string;
			};
		},
	) {
		const [updated] = await withDbErrorHandling(
			() =>
				db
					.update(orders)
					.set(values)
					.where(options?.where ?? eq(orders.id, id))
					.returning({ id: orders.id }),
			values,
		);

		if (!updated) {
			throw new ConflictException(`Order ${id} was modified or does not exist`);
		}

		if (values.statusId !== undefined && options?.history) {
			await this.recordHistory(
				db,
				id,
				options.history.userId,
				values.statusId,
				options.history.comment,
			);
		}

		return updated;
	}

	private async transition(
		id: OrderId,
		user: AuthUser,
		toStatus: OrderStatus,
		comment?: string,
	) {
		const { statusId: fromStatusId } = this.ensure(
			await this.drizzle.db.query.orders.findFirst({
				where: { id },
				columns: { statusId: true },
			}),
			id,
		);

		const fromStatus = ORDER_STATUS_BY_ID[fromStatusId];

		if (!fromStatus) {
			throw new ConflictException(
				`Invalid status ${fromStatusId} for order ${id}`,
			);
		}

		const allowed = ORDER_TRANSITION[fromStatus] ?? [];

		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		const statusId = ORDER_STATUSES[toStatus].id;

		await this.drizzle.db.transaction(async (tx) => {
			await this.persistUpdate(
				tx,
				id,
				{ statusId },
				{
					where: and(eq(orders.id, id), eq(orders.statusId, fromStatusId)),
					history: {
						userId: user.id,
						comment,
					},
				},
			);
		});

		return this.findOne(id);
	}

	private async recordHistory(
		db: DrizzleDb,
		orderId: OrderId,
		userId: UserId,
		statusId: number,
		comment?: string,
	) {
		await db.insert(orderStatusHistory).values({
			orderId,
			statusId,
			changedById: userId,
			comment: comment ?? null,
		});
	}
}
