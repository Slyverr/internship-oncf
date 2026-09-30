import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { canAccessOrder } from "../orders.access";
import { OrdersService } from "../orders.service";
import { OrderNumber } from "../orders.types";
import { OrderNumberPipe } from "../pipes/order-number.pipe";

export const OrderOwnershipGuard = createOwnershipGuard<
	OrdersService,
	OrderNumber
>({
	service: OrdersService,

	canAccess: async (service, id, user) =>
		canAccessOrder(await service.findOneForAccess(id), user),

	pipe: new OrderNumberPipe(),
	errorMessage: "You can only access your own orders",
});
