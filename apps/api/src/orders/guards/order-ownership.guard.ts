import { Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { hasOnePermission } from "src/auth/auth.utils";
import { OrdersService } from "../orders.service";
import { OrderIdPipe } from "../pipes/order-id.pipe";

@Injectable()
export class OrderOwnershipGuard implements CanActivate {
	private readonly orderIdPipe = new OrderIdPipe();

	constructor(private readonly ordersService: OrdersService) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!request.params.id) {
			return true;
		}

		const id = this.orderIdPipe.transform(request.params.id);
		const order = await this.ordersService.findOneForOwnership(id);

		if (
			order.userId !== user.id &&
			!hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)
		) {
			throw new ForbiddenException("You can only access your own orders");
		}

		return true;
	}
}
