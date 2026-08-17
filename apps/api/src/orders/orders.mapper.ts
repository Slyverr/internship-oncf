import { OrderStatus, Permission } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";

import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { ORDER_STATUSES } from "src/db/reference-data";

import { CreateOrderDto } from "./requests/create-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

export const toCreate = (dto: CreateOrderDto, user: AuthUser) => {
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

	return {
		...dto,
		userId,
		statusId: ORDER_STATUSES[status].id,
	};
};

export const toUpdate = (dto: UpdateOrderDto, user: AuthUser) => {
	if (
		dto.userId !== undefined &&
		dto.userId !== user.id &&
		!hasPermission(user, Permission.ORDERS_MANAGE_USER)
	) {
		throw new ForbiddenException("Cannot assign orders to other users");
	}

	const result = {
		...dto,
	};

	if (dto.status !== undefined) {
		if (!hasPermission(user, Permission.ORDERS_MANAGE_STATUS)) {
			throw new ForbiddenException("Cannot change order status");
		}

		result["statusId"] = ORDER_STATUSES[dto.status].id;
	}

	return result;
};
