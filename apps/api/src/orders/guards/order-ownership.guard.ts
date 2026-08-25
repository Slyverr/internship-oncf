import { Permission } from "@ecommand/shared";
import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { OrdersService } from "../orders.service";
import { OrderId } from "../orders.types";
import { OrderIdPipe } from "../pipes/order-id.pipe";

export const OrderOwnershipGuard = createOwnershipGuard<OrdersService, OrderId>(
	{
		service: OrdersService,

		canAccess: async (service, id, user) => {
			const order = await service.findOneForAccess(id);
			if (user.customerId === order.customerId) {
				return true;
			}

			if (user.id === order.createdByUserId) {
				return true;
			}

			return false;
		},

		pipe: new OrderIdPipe(),
		permission: Permission.ORDERS_MANAGE_OTHER,
		errorMessage: "You can only access your own orders",
	},
);
