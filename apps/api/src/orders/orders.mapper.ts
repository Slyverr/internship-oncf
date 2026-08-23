import { OrderStatus, Permission } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { ORDER_STATUSES } from "src/db/reference-data";
import { OrderInsert, OrderUpdate } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

export const toCreate = (dto: CreateOrderDto, user: AuthUser): OrderInsert => {
	const id = dto.userId ?? user.id;

	if (
		id !== user.id &&
		!hasOnePermission(user, Permission.ORDERS_MANAGE_OWNERSHIP)
	) {
		throw new ForbiddenException("Cannot assign orders to other users");
	}

	const status = hasOnePermission(user, Permission.ORDERS_STATUS_UPDATE)
		? (dto.status ?? OrderStatus.DRAFT)
		: OrderStatus.DRAFT;

	return {
		...dto,
		createdByUserId: id,
		statusId: ORDER_STATUSES[status].id,
	};
};

export const toUpdate = (dto: UpdateOrderDto, user: AuthUser): OrderUpdate => {
	if (dto.userId !== undefined && dto.userId !== user.id) {
		if (!hasOnePermission(user, Permission.ORDERS_MANAGE_OWNERSHIP)) {
			throw new ForbiddenException("Cannot assign orders to other users");
		}
	}

	let statusId: OrderUpdate["statusId"];

	if (dto.status !== undefined) {
		if (!hasOnePermission(user, Permission.ORDERS_STATUS_UPDATE)) {
			throw new ForbiddenException("Cannot change order status");
		}

		statusId = ORDER_STATUSES[dto.status].id;
	}

	return {
		...dto,
		createdByUserId: dto.userId !== undefined ? dto.userId : undefined,
		statusId,
	};
};
