import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
	Request,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ApiPathParam } from "@/common/decorators/api-path-param.decorator";
import { CustomersService } from "./customers.service";
import type { CustomerId } from "./customers.types";
import { CustomerIdPipe } from "./pipes/customer-id.pipe";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { ListCustomerQueryDto } from "./requests/list-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";
import { CustomerDeleteDto } from "./responses/customer-delete.dto";
import { CustomerDetailDto } from "./responses/customer-detail.dto";
import { CustomerListDto } from "./responses/customer-list.dto";

const CustomerIdParam = () => ApiPathParam("id", CustomerIdPipe);

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
	async findAll(
		@Query() query: ListCustomerQueryDto,
		@Request() req: AuthRequest,
	) {
		return this.customersService.findAll(query, req.user);
	}

	@Get(":id")
	@RequireAny(Permission.CUSTOMERS_READ)
	@CustomerDetailResponse()
	async findOne(
		@CustomerIdParam() id: CustomerId,
		@Request() req: AuthRequest,
	) {
		return this.customersService.findOne(id, req.user);
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
		@Request() req: AuthRequest,
	) {
		return this.customersService.update(id, dto, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.CUSTOMERS_DELETE)
	@CustomerDeleteResponse()
	async deactivate(@CustomerIdParam() id: CustomerId) {
		return this.customersService.deactivate(id);
	}
}
