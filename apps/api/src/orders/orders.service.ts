import { OrderStatus, Permission } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orderStatusHistory, orders } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { ORDER_STATUSES } from "src/db/reference-data";
import { UserId } from "src/users/users.types";
import { ORDER_STATUS_BY_ID, ORDER_TRANSITION } from "./orders.constants";
import { toCreate, toUpdate } from "./orders.mapper";
import {
	orderDetailRelations,
	orderListColumns,
	orderListRelations,
} from "./orders.query";
import type { OrderId } from "./orders.types";
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
		const where = !hasPermission(user, Permission.ORDERS_MANAGE_USER)
			? { userId: user.id }
			: {};

		return this.drizzle.db.query.orders.findMany({
			where,
			columns: orderListColumns,
			with: orderListRelations,
		});
	}

	async findOne(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			with: orderDetailRelations,
		});

		if (!order) {
			throw new NotFoundException(`Order ${id} not found`);
		}

		return order;
	}

	async findOneForOwnership(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				id: true,
				userId: true,
			},
		});

		if (!order) {
			throw new NotFoundException(`Order ${id} not found`);
		}

		return order;
	}

	async findOneForTransition(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});

		if (!order) {
			throw new NotFoundException(`Order ${id} not found`);
		}

		return order;
	}

	async update(id: OrderId, dto: UpdateOrderDto, user: AuthUser) {
		const values = toUpdate(dto, user);

		await withDbErrorHandling(
			() => this.drizzle.db.update(orders).set(values).where(eq(orders.id, id)),
			values,
		);

		return this.findOne(id);
	}

	async transition(
		id: OrderId,
		user: AuthUser,
		toStatus: OrderStatus,
		comment?: string,
	) {
		const { statusId } = await this.findOneForTransition(id);

		const fromStatus = ORDER_STATUS_BY_ID[statusId];
		const allowed = ORDER_TRANSITION[fromStatus];

		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		await this.recordHistory(id, ORDER_STATUSES[toStatus].id, user.id, comment);
		return this.update(id, { status: toStatus }, user);
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

		return deleted;
	}

	private async recordHistory(
		orderId: OrderId,
		userId: UserId,
		statusId: number,
		comment?: string,
	) {
		await this.drizzle.db.insert(orderStatusHistory).values({
			orderId,
			statusId,
			changedById: userId,
			comment: comment ?? null,
		});
	}
}
