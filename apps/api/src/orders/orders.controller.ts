import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderOwnershipGuard } from "./guards/order-ownership.guard";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";
import { OrderIdPipe } from "./pipes/order-id.pipe";

const OrderIdParam = () => Param("id", OrderIdPipe);

@Controller("orders")
@UseGuards(OrderOwnershipGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@Permissions(Permission.ORDERS_CREATE)
	create(@Body() createOrderDto: CreateOrderDto, @Request() req: AuthRequest) {
		return this.ordersService.create(createOrderDto, req.user);
	}

	@Get()
	@Permissions(Permission.ORDERS_READ)
	findAll(@Request() req: AuthRequest) {
		return this.ordersService.findAll(req.user);
	}

	@Get(":id")
	@Permissions(Permission.ORDERS_READ)
	findOne(@OrderIdParam() id: OrderId) {
		return this.ordersService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.ORDERS_UPDATE)
	update(
		@OrderIdParam() id: OrderId,
		@Body() updateOrderDto: UpdateOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.update(id, updateOrderDto, req.user);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.ORDERS_UPDATE)
	submit(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.submit(id, req.user);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.ORDERS_APPROVE)
	approve(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.approve(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.ORDERS_REJECT)
	reject(
		@OrderIdParam() id: OrderId,
		@Body("reason") reason: string,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.reject(id, reason, req.user);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.ORDERS_UPDATE)
	cancel(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.cancel(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.ORDERS_EXECUTE)
	sendToDtm(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.sendToDtm(id, req.user);
	}

	@Delete(":id")
	@Permissions(Permission.ORDERS_DELETE)
	remove(@OrderIdParam() id: OrderId) {
		return this.ordersService.remove(id);
	}
}
