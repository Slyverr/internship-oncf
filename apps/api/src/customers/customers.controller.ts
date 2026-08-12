import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
} from "@nestjs/common";
import { Permissions } from "src/auth/permissions.decorator";
import { CustomersService } from "./customers.service";
import type { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

const CustomerIdParam = () => Param("id", ParseIntPipe);

@Controller("customers")
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get()
	@Permissions(Permission.CUSTOMERS_READ)
	findAll() {
		return this.customersService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.CUSTOMERS_READ)
	findOne(@CustomerIdParam() id: CustomerId) {
		return this.customersService.findOne(id);
	}

	@Post()
	@Permissions(Permission.CUSTOMERS_CREATE)
	create(@Body() dto: CreateCustomerDto) {
		return this.customersService.create(dto);
	}

	@Put(":id")
	@Permissions(Permission.CUSTOMERS_UPDATE)
	update(@CustomerIdParam() id: CustomerId, @Body() dto: UpdateCustomerDto) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	@Permissions(Permission.CUSTOMERS_DELETE)
	remove(@CustomerIdParam() id: CustomerId) {
		return this.customersService.remove(id);
	}
}
