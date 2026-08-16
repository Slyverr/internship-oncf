import { OrderStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ForbiddenException,
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
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import {
	orderDetailRelations,
	orderListColumns,
	orderListRelations,
} from "./orders.query";
import type { OrderId } from "./orders.types";

@Injectable()
export class OrdersService {
	constructor(private readonly drizzle: DrizzleService) {}

	private normalizeCreate(dto: CreateOrderDto, user: AuthUser) {
		const userId = dto.userId ?? user.id;
		if (
			!hasPermission(user, Permission.ORDERS_MANAGE_USER) &&
			userId !== user.id
		) {
			throw new ForbiddenException("Cannot assign orders to other users");
		}

		const status = hasPermission(user, Permission.ORDERS_MANAGE_STATUS)
			? (dto.status ?? OrderStatus.DRAFT)
			: OrderStatus.DRAFT;

		return { ...dto, userId, statusId: ORDER_STATUSES[status].id };
	}

	private normalizeUpdate(dto: UpdateOrderDto, user: AuthUser) {
		if (dto.userId !== undefined && dto.userId !== user.id) {
			if (!hasPermission(user, Permission.ORDERS_MANAGE_USER)) {
				throw new ForbiddenException("Cannot assign orders to other users");
			}
		}

		const result = { ...dto };
		if (dto.status !== undefined) {
			if (!hasPermission(user, Permission.ORDERS_MANAGE_STATUS)) {
				throw new ForbiddenException("Cannot change order status");
			}

			result["statusId"] = ORDER_STATUSES[dto.status].id;
		}

		return result;
	}

	private async recordHistory(
		orderId: OrderId,
		statusId: number,
		userId: number,
		comment?: string,
	) {
		await this.drizzle.db.insert(orderStatusHistory).values({
			orderId,
			statusId,
			changedById: userId,
			comment: comment ?? null,
		});
	}

	private async transition(
		id: OrderId,
		toStatus: OrderStatus,
		user: AuthUser,
		comment?: string,
	) {
		const order = await this.findOne(id);

		// Get from status name from constants
		const fromStatusName = Object.keys(ORDER_STATUSES).find(
			(key) => ORDER_STATUSES[key as OrderStatus].id === order.statusId,
		) as OrderStatus;

		// Validate transition
		const allowedTransitions: Record<string, string[]> = {
			[OrderStatus.DRAFT]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],
			[OrderStatus.SUBMITTED]: [OrderStatus.APPROVED, OrderStatus.REJECTED],
			[OrderStatus.APPROVED]: [OrderStatus.SENT_TO_DTM],
			[OrderStatus.SENT_TO_DTM]: [OrderStatus.IN_PROGRESS],
			[OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
		};

		const allowed = allowedTransitions[fromStatusName] || [];
		if (!allowed.includes(toStatus)) {
			throw new BadRequestException(
				`Cannot transition from ${fromStatusName} to ${toStatus}`,
			);
		}

		const toStatusId = ORDER_STATUSES[toStatus].id;

		await this.recordHistory(id, toStatusId, user.id, comment);

		const [updated] = await this.drizzle.db
			.update(orders)
			.set({ statusId: toStatusId })
			.where(eq(orders.id, id))
			.returning();

		return updated;
	}

	async create(dto: CreateOrderDto, user: AuthUser) {
		const values = this.normalizeCreate(dto, user);

		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(orders).values(values).returning(),
			values,
		);
		return created;
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

	async update(id: OrderId, dto: UpdateOrderDto, user: AuthUser) {
		const values = this.normalizeUpdate(dto, user);

		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(orders)
					.set(values)
					.where(eq(orders.id, id))
					.returning(),
			values,
		);

		if (!updated) throw new NotFoundException(`Order ${id} not found`);
		return updated;
	}

	async remove(id: OrderId) {
		const [deleted] = await this.drizzle.db
			.delete(orders)
			.where(eq(orders.id, id))
			.returning();
		if (!deleted) throw new NotFoundException(`Order ${id} not found`);
		return deleted;
	}

	async submit(id: OrderId, user: AuthUser) {
		return this.transition(id, OrderStatus.SUBMITTED, user);
	}

	async approve(id: OrderId, user: AuthUser) {
		return this.transition(id, OrderStatus.APPROVED, user);
	}

	async reject(id: OrderId, reason: string, user: AuthUser) {
		if (!reason) throw new BadRequestException("Rejection reason required");
		return this.transition(id, OrderStatus.REJECTED, user, reason);
	}

	async cancel(id: OrderId, user: AuthUser) {
		return this.transition(id, OrderStatus.CANCELLED, user);
	}

	async sendToDtm(id: OrderId, user: AuthUser) {
		return this.transition(id, OrderStatus.SENT_TO_DTM, user);
	}
}
