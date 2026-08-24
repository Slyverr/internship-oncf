import { OrderStatus, Permission } from "@ecommand/shared";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { ORDER_STATUSES } from "src/db/reference-data";
import { OrderInsert, OrderUpdate } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

export const toCreate = (dto: CreateOrderDto, user: AuthUser): OrderInsert => {
	const customerId = dto.customerId ?? user.customerId;
	if (!customerId) {
		throw new BadRequestException("A valid customerId must be provided");
	}

	if (user.customerId && customerId !== user.customerId) {
		if (!hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)) {
			throw new ForbiddenException("Cannot create orders for other customers");
		}
	}

	const canManageStatus = hasOnePermission(
		user,
		Permission.ORDERS_STATUS_UPDATE,
	);

	const targetStatus = canManageStatus
		? (dto.status ?? OrderStatus.DRAFT)
		: OrderStatus.DRAFT;

	return {
		...dto,
		customerId,
		createdByUserId: user.id,
		statusId: ORDER_STATUSES[targetStatus].id,
	};
};

export const toUpdate = (dto: UpdateOrderDto, user: AuthUser): OrderUpdate => {
	let statusId: OrderUpdate["statusId"];
	if (dto.status !== undefined) {
		if (!hasOnePermission(user, Permission.ORDERS_STATUS_UPDATE)) {
			throw new ForbiddenException("Cannot change order status");
		}

		statusId = ORDER_STATUSES[dto.status].id;
	}

	return {
		...dto,
		statusId,
	};
};
