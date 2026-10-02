import {
	API_ERROR_CODES,
	NotificationMessageCode,
	OrderStatus,
	Permission,
} from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orders } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { ORDER_STATUSES } from "@/database/reference-data";
import { NotificationsService } from "@/notifications/notifications.service";
import {
	ORDER_QUANTITY_PATTERN,
	ORDER_STATUS_BY_ID,
	ORDER_TRANSITION,
} from "./orders.constants";
import { OrdersMapper } from "./orders.mapper";
import { OrdersQuery } from "./orders.query";
import type { OrderId, OrderIdentifier, OrderNumber } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { OrderListQueryDto } from "./requests/order-list-query.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

@Injectable()
export class OrdersService {
	constructor(
		private readonly notifications: NotificationsService,
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
		return this.ensure(await this.ordersQuery.findOrder(id));
	}

	async findOneForOwnership(identifier: OrderIdentifier) {
		const order =
			typeof identifier === "number"
				? await this.ordersQuery.findOrderForOwnership(identifier)
				: await this.ordersQuery.findOrderForOwnershipByNumber(identifier);
		return this.ensure(order);
	}

	async findOneForAccess(identifier: OrderIdentifier) {
		const order =
			typeof identifier === "number"
				? await this.ordersQuery.findOrderForAccess(identifier)
				: await this.ordersQuery.findOrderForAccessByNumber(identifier);
		return this.ensure(order);
	}

	async resolveOrderId(identifier: OrderIdentifier): Promise<OrderId> {
		if (typeof identifier === "number") return identifier;
		const order = await this.ordersQuery.findOrderIdByNumber(
			identifier as OrderNumber,
		);
		return this.ensure(order).id;
	}

	async update(id: OrderId, dto: UpdateOrderDto, user: AuthUser) {
		const order = await this.findOne(id);

		const editsDetails = Object.entries(dto).some(
			([key, value]) => key !== "status" && value !== undefined,
		);
		const changesCustomer =
			dto.customerId !== undefined && dto.customerId !== order.customerId;

		if (editsDetails && order.orderStatus?.name !== OrderStatus.DRAFT) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_MUST_BE_DRAFT,
			});
		}

		if (
			changesCustomer &&
			!hasOnePermission(user, Permission.ORDERS_MANAGE_OWNERSHIP)
		) {
			throw new ForbiddenException({
				code: API_ERROR_CODES.ORDER_OWNERSHIP_CHANGE_FORBIDDEN,
			});
		}

		const quantity = dto.quantityDemanded;
		if (
			quantity !== undefined &&
			(!ORDER_QUANTITY_PATTERN.test(quantity) || Number(quantity) <= 0)
		) {
			throw new BadRequestException({
				code: API_ERROR_CODES.ORDER_QUANTITY_INVALID,
			});
		}

		const start = dto.startDate === undefined ? order.startDate : dto.startDate;
		const end = dto.endDate === undefined ? order.endDate : dto.endDate;

		if (start && end && new Date(start) > new Date(end)) {
			throw new BadRequestException({
				code: API_ERROR_CODES.ORDER_DATE_RANGE_INVALID,
			});
		}

		const values = this.ordersMapper.toUpdate(dto, user);

		await this.ordersQuery.updateOrder(id, values, {
			where: and(eq(orders.id, id), eq(orders.statusId, order.statusId)),
			history: { userId: user.id },
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
		const order = await this.findOne(id);
		if (order.orderStatus?.name !== OrderStatus.DRAFT) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_MUST_BE_DRAFT,
			});
		}

		const deleted = await this.ordersQuery.deleteOrder(id);
		return this.ensure(deleted);
	}

	private async transition(
		id: OrderId,
		user: AuthUser,
		toStatus: OrderStatus,
		comment?: string,
	) {
		const order = this.ensure(await this.ordersQuery.findOrderStatus(id));

		const fromStatus = ORDER_STATUS_BY_ID[order.statusId];
		if (!fromStatus) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_TRANSITION_INVALID,
			});
		}

		const allowed = ORDER_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_TRANSITION_INVALID,
			});
		}

		const statusId = ORDER_STATUSES[toStatus].id;
		const notification = this.notifications.createChangeRecord(
			order.createdByUserId,
			user.id,
			"orders",
			id,
			{
				code: NotificationMessageCode.ORDER_STATUS_CHANGED,
				parameters: { recordCode: order.orderNumber, status: toStatus },
			},
		);
		await this.ordersQuery.updateOrder(
			id,
			{ statusId },
			{
				where: and(eq(orders.id, id), eq(orders.statusId, order.statusId)),
				history: {
					userId: user.id,
					comment,
				},
				notification,
			},
		);

		return this.findOne(id);
	}

	private ensure<T>(value: T | undefined): T {
		if (!value) {
			throw new NotFoundException({ code: API_ERROR_CODES.ORDER_NOT_FOUND });
		}
		return value;
	}
}
