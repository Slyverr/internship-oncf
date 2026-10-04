import { Permission } from "@ecommand/shared";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import {
	ApiPathParam,
	ApiStringPathParam,
} from "@/common/decorators/api-path-param.decorator";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import { OrdersService } from "@/orders/orders.service";
import type { OrderNumber } from "@/orders/orders.types";
import { OrderNumberPipe } from "@/orders/pipes/order-number.pipe";
import { TrainIdPipe } from "./pipes/train-id.pipe";
import { WagonIdPipe } from "./pipes/wagon-id.pipe";
import { UpdateTrainPositionDto } from "./requests/update-train-position.dto";
import { UpdateWagonPositionDto } from "./requests/update-wagon-position.dto";
import { TrackOrderDto } from "./responses/track-order.dto";
import { TrackTrainDto } from "./responses/track-train.dto";
import { TrackWagonDto } from "./responses/track-wagon.dto";
import { TrainPositionDto } from "./responses/train-position.dto";
import { WagonPositionDto } from "./responses/wagon-position.dto";
import { TrackingService } from "./tracking.service";
import type { TrainId, WagonId } from "./tracking.types";

const OrderNumberParam = () => ApiStringPathParam("id", OrderNumberPipe);

const { detail: TrackWagonResponse } = createCrudResponses({
	detail: TrackWagonDto,
	list: TrackWagonDto,
});

const { detail: TrackTrainResponse } = createCrudResponses({
	detail: TrackTrainDto,
	list: TrackTrainDto,
});

const { list: TrackOrderResponse } = createCrudResponses({
	detail: TrackOrderDto,
	list: TrackOrderDto,
});

const { detail: WagonPositionResponse } = createCrudResponses({
	detail: WagonPositionDto,
	list: WagonPositionDto,
});

const { detail: TrainPositionResponse } = createCrudResponses({
	detail: TrainPositionDto,
	list: TrainPositionDto,
});

@Controller("tracking")
export class TrackingController {
	constructor(
		private readonly trackingService: TrackingService,
		private readonly ordersService: OrdersService,
	) {}

	@Get("wagon/:wagonNumber")
	@RequireAny(Permission.TRACKING_MANAGE)
	@TrackWagonResponse()
	async trackWagon(@Param("wagonNumber") wagonNumber: string) {
		return this.trackingService.trackWagon(wagonNumber);
	}

	@Get("train/:trainNumber")
	@RequireAny(Permission.TRACKING_MANAGE)
	@TrackTrainResponse()
	async trackTrain(@Param("trainNumber") trainNumber: string) {
		return this.trackingService.trackTrain(trainNumber);
	}

	@Get("order/:id")
	@RequireAny(Permission.TRACKING_READ)
	@UseGuards(OrderOwnershipGuard)
	@TrackOrderResponse()
	async trackOrder(@OrderNumberParam() orderNumber: OrderNumber) {
		return this.trackingService.trackOrder(
			await this.ordersService.resolveOrderId(orderNumber),
		);
	}

	@Post("wagon/:id/position")
	@RequireAny(Permission.TRACKING_UPDATE)
	@WagonPositionResponse()
	async updateWagonPosition(
		@ApiPathParam("id", WagonIdPipe) id: WagonId,
		@Body() dto: UpdateWagonPositionDto,
	) {
		return this.trackingService.updateWagonPosition(id, dto);
	}

	@Post("train/:id/position")
	@RequireAny(Permission.TRACKING_UPDATE)
	@TrainPositionResponse()
	async updateTrainPosition(
		@ApiPathParam("id", TrainIdPipe) id: TrainId,
		@Body() dto: UpdateTrainPositionDto,
	) {
		return this.trackingService.updateTrainPosition(id, dto);
	}
}
