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
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { OrderOwnershipGuard } from "./guards/order-ownership.guard";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";
import { OrderIdPipe } from "./pipes/order-id.pipe";
import { CreateOrderDto } from "./requests/create-order.dto";
import { RejectOrderDto } from "./requests/reject-order.dto";
import { UpdateOrderDto } from "./requests/update-order.dto";
import { EligibleOrderForProgramDto } from "./responses/eligible-order-for-program.dto";
import { OrderDeleteDto } from "./responses/order-delete.dto";
import { OrderDetailDto } from "./responses/order-detail.dto";
import { OrderListDto } from "./responses/order-list.dto";

const OrderIdParam = () => Param("id", OrderIdPipe);

const {
	list: OrderListResponse,
	detail: OrderDetailResponse,
	create: OrderCreateResponse,
	remove: OrderDeleteResponse,
	eligibleForPrograms: EligibleOrderForProgramsResponse,
} = createCrudResponses({
	list: OrderListDto,
	detail: OrderDetailDto,
	remove: OrderDeleteDto,

	custom: {
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

	@Get()
	@RequireAny(Permission.ORDERS_READ)
	@OrderListResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.ordersService.findAll(req.user);
	}

	@Get("eligible-for-programs")
	@RequireAny(Permission.ORDERS_READ)
	@EligibleOrderForProgramsResponse()
	async findEligibleForPrograms(
		@Request()
		req: AuthRequest,
		@Query() query: ListQueryDto,
	) {
		return this.ordersService.findEligibleForPrograms(req.user, query);
	}

	@Get(":id")
	@RequireAny(Permission.ORDERS_READ)
	@OrderDetailResponse()
	async findOne(@OrderIdParam() id: OrderId) {
		return this.ordersService.findOne(id);
	}

	@Patch(":id")
	@RequireAny(Permission.ORDERS_UPDATE)
	@OrderDetailResponse()
	async update(
		@OrderIdParam() id: OrderId,
		@Body() updateOrderDto: UpdateOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.update(id, updateOrderDto, req.user);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_UPDATE)
	@OrderDetailResponse()
	async submit(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.submit(id, req.user);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_APPROVE)
	@OrderDetailResponse()
	async approve(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.approve(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_REJECT)
	@OrderDetailResponse()
	async reject(
		@OrderIdParam() id: OrderId,
		@Body() body: RejectOrderDto,
		@Request() req: AuthRequest,
	) {
		return this.ordersService.reject(id, body.reason, req.user);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_UPDATE)
	@OrderDetailResponse()
	async cancel(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.cancel(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_EXECUTE)
	@OrderDetailResponse()
	async sendToDtm(@OrderIdParam() id: OrderId, @Request() req: AuthRequest) {
		return this.ordersService.sendToDtm(id, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.ORDERS_DELETE)
	@OrderDeleteResponse()
	async remove(@OrderIdParam() id: OrderId) {
		return this.ordersService.remove(id);
	}
}
