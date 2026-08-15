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
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Permissions } from "src/auth/permissions.decorator";
import { MessageResponseDto } from "src/common/dto/message.response.dto";
import { CustomersService } from "./customers.service";
import type { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateCustomerResponseDto } from "./dto/create-customer.response.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdateCustomerResponseDto } from "./dto/update-customer.response.dto";

const CustomerIdParam = () => Param("id", ParseIntPipe);

@Controller("customers")
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get()
	@Permissions(Permission.CUSTOMERS_READ)
	@ApiOkResponse({ type: [CreateCustomerResponseDto] })
	@ApiUnauthorizedResponse()
	async findAll() {
		return this.customersService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.CUSTOMERS_READ)
	@ApiOkResponse({ type: CreateCustomerResponseDto })
	@ApiUnauthorizedResponse()
	@ApiNotFoundResponse()
	async findOne(@CustomerIdParam() id: CustomerId) {
		return this.customersService.findOne(id);
	}

	@Post()
	@Permissions(Permission.CUSTOMERS_CREATE)
	@ApiOkResponse({ type: CreateCustomerResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	async create(@Body() dto: CreateCustomerDto) {
		return this.customersService.create(dto);
	}

	@Put(":id")
	@Permissions(Permission.CUSTOMERS_UPDATE)
	@ApiOkResponse({ type: UpdateCustomerResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async update(
		@CustomerIdParam() id: CustomerId,
		@Body() dto: UpdateCustomerDto,
	) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	@Permissions(Permission.CUSTOMERS_DELETE)
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async remove(@CustomerIdParam() id: CustomerId) {
		return this.customersService.remove(id);
	}
}
