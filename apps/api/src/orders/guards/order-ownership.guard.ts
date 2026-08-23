import { Permission } from "@ecommand/shared";
import { createOwnershipGuard } from "src/auth/guards/ownership.factory";
import { OrdersService } from "../orders.service";
import { OrderId } from "../orders.types";
import { OrderIdPipe } from "../pipes/order-id.pipe";

export const OrderOwnershipGuard = createOwnershipGuard<OrdersService, OrderId>(
	{
		service: OrdersService,
		resolveOwnerId: async (service, id) => {
			const owner = await service.findOneForOwnership(id);
			return owner.createdByUserId;
		},

		pipe: new OrderIdPipe(),
		permission: Permission.ORDERS_MANAGE_OTHER,
		errorMessage: "You can only access your own orders",
	},
);
