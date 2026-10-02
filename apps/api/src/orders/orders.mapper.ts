import { API_ERROR_CODES, OrderStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { canAccessCustomer } from "@/auth/customer-scope";
import { generateDocumentNumber } from "@/common/utils/document-number";
import { ORDER_STATUSES } from "@/database/reference-data";
import { OrderInsert, OrderUpdate } from "./orders.types";
import { CreateOrderDto } from "./requests/create-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";

@Injectable()
export class OrdersMapper {
	toCreate(dto: CreateOrderDto, user: AuthUser): OrderInsert {
		const customerId = dto.customerId ?? user.customerId;
		if (!customerId) {
			throw new BadRequestException({
				code: API_ERROR_CODES.ORDER_CUSTOMER_REQUIRED,
			});
		}

		if (!canAccessCustomer(user, customerId)) {
			throw new ForbiddenException({
				code: API_ERROR_CODES.ORDER_CUSTOMER_ACCESS_DENIED,
			});
		}

		const canManageStatus = hasOnePermission(
			user,
			Permission.ORDERS_MANAGE_STATUS,
		);

		const targetStatus = canManageStatus
			? (dto.status ?? OrderStatus.DRAFT)
			: OrderStatus.DRAFT;

		const orderNumber = generateDocumentNumber("ORD");

		return {
			...dto,
			customerId,
			orderNumber,
			createdByUserId: user.id,
			statusId: ORDER_STATUSES[targetStatus].id,
		};
	}

	toUpdate(dto: UpdateOrderDto, user: AuthUser): OrderUpdate {
		let statusId: OrderUpdate["statusId"];
		if (dto.status !== undefined) {
			if (!hasOnePermission(user, Permission.ORDERS_MANAGE_STATUS)) {
				throw new ForbiddenException({
					code: API_ERROR_CODES.ORDER_STATUS_CHANGE_FORBIDDEN,
				});
			}
			statusId = ORDER_STATUSES[dto.status].id;
		}

		return {
			...dto,
			statusId,
		};
	}
}
