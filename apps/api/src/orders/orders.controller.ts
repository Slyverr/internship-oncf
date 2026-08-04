import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
} from "@nestjs/common";
import { Permissions } from "src/auth/permissions.decorator";
import { Permission } from "src/db/reference-data";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";

const OrderIdParam = () => Param("id", ParseIntPipe);

@Controller("orders")
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@Permissions(Permission.ORDERS_CREATE)
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	@Permissions(Permission.ORDERS_READ)
	findAll() {
		return this.ordersService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.ORDERS_READ)
	findOne(@OrderIdParam() id: OrderId) {
		return this.ordersService.findOne(+id);
	}

	@Patch(":id")
	@Permissions(Permission.ORDERS_UPDATE)
	update(@OrderIdParam() id: OrderId, @Body() updateOrderDto: UpdateOrderDto) {
		return this.ordersService.update(+id, updateOrderDto);
	}

	@Delete(":id")
	@Permissions(Permission.ORDERS_DELETE)
	remove(@OrderIdParam() id: OrderId) {
		return this.ordersService.remove(+id);
	}
}
