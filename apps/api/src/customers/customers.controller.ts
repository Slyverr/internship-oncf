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
	Query,
} from "@nestjs/common";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { CustomersService } from "./customers.service";
import type { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { ListCustomerQueryDto } from "./requests/list-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";
import { CustomerDeleteDto } from "./responses/customer-delete.dto";
import { CustomerDetailDto } from "./responses/customer-detail.dto";
import { CustomerListDto } from "./responses/customer-list.dto";

const CustomerIdParam = () => Param("id", ParseIntPipe);

const {
	list: CustomerListResponse,
	detail: CustomerDetailResponse,
	create: CustomerCreateResponse,
	remove: CustomerDeleteResponse,
} = createCrudResponses({
	list: CustomerListDto,
	detail: CustomerDetailDto,
	remove: CustomerDeleteDto,
});

@Controller("customers")
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get()
	@RequireAny(Permission.CUSTOMERS_READ)
	@CustomerListResponse()
	async findAll(@Query() query: ListCustomerQueryDto) {
		return this.customersService.findAll(query);
	}

	@Get(":id")
	@RequireAny(Permission.CUSTOMERS_READ)
	@CustomerDetailResponse()
	async findOne(@CustomerIdParam() id: CustomerId) {
		return this.customersService.findOne(id);
	}

	@Post()
	@RequireAny(Permission.CUSTOMERS_CREATE)
	@CustomerCreateResponse()
	async create(@Body() dto: CreateCustomerDto) {
		return this.customersService.create(dto);
	}

	@Put(":id")
	@RequireAny(Permission.CUSTOMERS_UPDATE)
	@CustomerDetailResponse()
	async update(
		@CustomerIdParam() id: CustomerId,
		@Body() dto: UpdateCustomerDto,
	) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	@RequireAny(Permission.CUSTOMERS_DELETE)
	@CustomerDeleteResponse()
	async deactivate(@CustomerIdParam() id: CustomerId) {
		return this.customersService.deactivate(id);
	}
}
