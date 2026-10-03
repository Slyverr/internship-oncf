import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ApiStringPathParam } from "@/common/decorators/api-path-param.decorator";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { OrderOwnershipGuard } from "./guards/order-ownership.guard";
import { OrdersService } from "./orders.service";
import type { OrderNumber } from "./orders.types";
import { OrderNumberPipe } from "./pipes/order-number.pipe";
import { CreateOrderDto } from "./requests/create-order.dto";
import { OrderListQueryDto } from "./requests/order-list-query.dto";
import { RejectOrderDto } from "./requests/reject-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";
import { EligibleOrderForProgramDto } from "./responses/eligible-order-for-program.dto";
import { OrderDeleteDto } from "./responses/order-delete.dto";
import { OrderDetailDto } from "./responses/order-detail.dto";
import { OrderListDto } from "./responses/order-list.dto";

const OrderNumberParam = () => ApiStringPathParam("id", OrderNumberPipe);

const {
	list: OrderListResponse,
	detail: OrderDetailResponse,
	create: OrderCreateResponse,
	duplicate: OrderDuplicateResponse,
	remove: OrderDeleteResponse,
	eligibleForPrograms: EligibleOrderForProgramsResponse,
} = createCrudResponses({
	list: OrderListDto,
	detail: OrderDetailDto,
	remove: OrderDeleteDto,

	custom: {
		duplicate: {
			type: OrderDetailDto,
			status: HttpStatus.CREATED,
			errors: [
				HttpStatus.UNAUTHORIZED,
				HttpStatus.BAD_REQUEST,
				HttpStatus.FORBIDDEN,
				HttpStatus.NOT_FOUND,
			],
		},
		eligibleForPrograms: {
			type: [EligibleOrderForProgramDto],
			status: HttpStatus.OK,
			errors: [HttpStatus.UNAUTHORIZED],
		},
	},
});

@Controller("orders")
@UseGuards(OrderOwnershipGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@RequireAny(Permission.ORDERS_CREATE)
	@OrderCreateResponse()
	async create(
		@Body() createOrderDto: CreateOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.create(createOrderDto, req.user);
	}

	@Post(":id/duplicate")
	@RequireAny(Permission.ORDERS_CREATE)
	@OrderDuplicateResponse()
	async duplicate(
		@OrderNumberParam() number: OrderNumber,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.duplicate(
			await this.ordersService.resolveOrderId(number),
			req.user,
		);
	}

	@Get()
	@RequireAny(Permission.ORDERS_READ)
	@OrderListResponse()
	async findAll(
		@Request() req: AuthRequest,
		@Query() query: OrderListQueryDto,
	) {
		return this.ordersService.findAll(req.user, query);
	}

	@Get("eligible-for-programs")
	@RequireAny(Permission.ORDERS_READ)
	@EligibleOrderForProgramsResponse()
	async findEligibleForPrograms(
		@Request() req: AuthRequest,
		@Query() query: ListQueryDto,
	) {
		return this.ordersService.findEligibleForPrograms(req.user, query);
	}

	@Get(":id")
	@RequireAny(Permission.ORDERS_READ)
	@OrderDetailResponse()
	async findOne(@OrderNumberParam() number: OrderNumber) {
		const id = await this.ordersService.resolveOrderId(number);
		return this.ordersService.findOne(id);
	}

	@Patch(":id")
	@RequireAny(Permission.ORDERS_UPDATE)
	@OrderDetailResponse()
	async update(
		@OrderNumberParam() number: OrderNumber,
		@Body() updateOrderDto: UpdateOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.update(
			await this.ordersService.resolveOrderId(number),
			updateOrderDto,
			req.user,
		);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_ACTION_SUBMIT)
	@OrderDetailResponse()
	async submit(
		@OrderNumberParam() number: OrderNumber,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.submit(
			await this.ordersService.resolveOrderId(number),
			req.user,
		);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_ACTION_APPROVE)
	@OrderDetailResponse()
	async approve(
		@OrderNumberParam() number: OrderNumber,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.approve(
			await this.ordersService.resolveOrderId(number),
			req.user,
		);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_ACTION_REJECT)
	@OrderDetailResponse()
	async reject(
		@OrderNumberParam() number: OrderNumber,
		@Body() body: RejectOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.reject(
			await this.ordersService.resolveOrderId(number),
			body.reason,
			req.user,
		);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_ACTION_CANCEL)
	@OrderDetailResponse()
	async cancel(
		@OrderNumberParam() number: OrderNumber,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.cancel(
			await this.ordersService.resolveOrderId(number),
			req.user,
		);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_ACTION_SEND_TO_DTM)
	@OrderDetailResponse()
	async sendToDtm(
		@OrderNumberParam() number: OrderNumber,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.sendToDtm(
			await this.ordersService.resolveOrderId(number),
			req.user,
		);
	}

	@Delete(":id")
	@RequireAny(Permission.ORDERS_DELETE)
	@OrderDeleteResponse()
	async remove(@OrderNumberParam() number: OrderNumber) {
		return this.ordersService.remove(
			await this.ordersService.resolveOrderId(number),
		);
	}
}
