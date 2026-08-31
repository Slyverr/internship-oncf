import { OrderStatus } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orders } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { ORDER_STATUSES } from "@/database/reference-data";
import { ORDER_STATUS_BY_ID, ORDER_TRANSITION } from "./orders.constants";
import { OrdersMapper } from "./orders.mapper";
import { OrdersQuery } from "./orders.query";
import type { OrderId } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { OrderListQueryDto } from "./requests/order-list-query.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

@Injectable()
export class OrdersService {
	constructor(
		private readonly ordersQuery: OrdersQuery,
		private readonly ordersMapper: OrdersMapper,
	) {}

	async create(dto: CreateOrderDto, user: AuthUser) {
		const values = this.ordersMapper.toCreate(dto, user);
		const created = await this.ordersQuery.createOrder(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: OrderListQueryDto) {
		return this.ordersQuery.findOrders(user, query);
	}

	async findEligibleForPrograms(user: AuthUser, query: ListQueryDto) {
		return this.ordersQuery.findEligibleOrdersForPrograms(user, query);
	}

	async findOne(id: OrderId) {
		const order = await this.ordersQuery.findOrder(id);
		return this.ensure(order, id);
	}

	async findOneForOwnership(id: OrderId) {
		const order = await this.ordersQuery.findOrderForOwnership(id);
		return this.ensure(order, id);
	}

	async findOneForAccess(id: OrderId) {
		const order = await this.ordersQuery.findOrderForAccess(id);
		return this.ensure(order, id);
	}

	async update(id: OrderId, dto: UpdateOrderDto, user: AuthUser) {
		const values = this.ordersMapper.toUpdate(dto, user);
		await this.ordersQuery.updateOrder(id, values, {
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
		const deleted = await this.ordersQuery.deleteOrder(id);
		return this.ensure(deleted, id);
	}

	private async transition(
		id: OrderId,
		user: AuthUser,
		toStatus: OrderStatus,
		comment?: string,
	) {
		const order = this.ensure(await this.ordersQuery.findOrderStatus(id), id);

		const fromStatus = ORDER_STATUS_BY_ID[order.statusId];
		if (!fromStatus) {
			throw new ConflictException(
				`Invalid status ${order.statusId} for order ${id}`,
			);
		}

		const allowed = ORDER_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		const statusId = ORDER_STATUSES[toStatus].id;
		await this.ordersQuery.updateOrder(
			id,
			{ statusId },
			{
				where: and(eq(orders.id, id), eq(orders.statusId, order.statusId)),
				history: {
					userId: user.id,
					comment,
				},
			},
		);

		return this.findOne(id);
	}

	private ensure<T>(value: T | undefined, id: OrderId): T {
		if (!value) {
			throw new NotFoundException(`Order ${id} not found`);
		}
		return value;
	}
}
