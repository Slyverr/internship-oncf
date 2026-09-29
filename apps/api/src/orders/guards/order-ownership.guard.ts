import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { canAccessOrder } from "../orders.access";
import { OrdersService } from "../orders.service";
import { OrderId } from "../orders.types";
import { OrderIdPipe } from "../pipes/order-id.pipe";

export const OrderOwnershipGuard = createOwnershipGuard<OrdersService, OrderId>(
	{
		service: OrdersService,

		canAccess: async (service, id, user) =>
			canAccessOrder(await service.findOneForAccess(id), user),

		pipe: new OrderIdPipe(),
		errorMessage: "You can only access your own orders",
	},
);
