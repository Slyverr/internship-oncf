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
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";

const OrderIdParam = () => Param("id", ParseIntPipe);

@Controller("orders")
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	findAll() {
		return this.ordersService.findAll();
	}

	@Get(":id")
	findOne(@OrderIdParam() id: OrderId) {
		return this.ordersService.findOne(+id);
	}

	@Patch(":id")
	update(@OrderIdParam() id: OrderId, @Body() updateOrderDto: UpdateOrderDto) {
		return this.ordersService.update(+id, updateOrderDto);
	}

	@Delete(":id")
	remove(@OrderIdParam() id: OrderId) {
		return this.ordersService.remove(+id);
	}
}
