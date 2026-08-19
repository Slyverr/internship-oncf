import { Permission } from "@ecommand/shared";
import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/auth/auth.types";
import { RequireAny } from "src/auth/permissions.decorator";
import { TrackOrderResponseDto } from "./dto/track-order.response.dto";
import { TrackTrainResponseDto } from "./dto/track-train.response.dto";
import { TrackWagonResponseDto } from "./dto/track-wagon.response.dto";
import { UpdatePositionResponseDto } from "./dto/update-position.response.dto";
import { UpdateTrainPositionDto } from "./dto/update-train-position.dto";
import { UpdateWagonPositionDto } from "./dto/update-wagon-position.dto";
import { TrainIdPipe } from "./pipes/train-id.pipe";
import { WagonIdPipe } from "./pipes/wagon-id.pipe";
import { TrackingService } from "./tracking.service";
import type { TrainId, WagonId } from "./tracking.types";

@Controller("tracking")
export class TrackingController {
	constructor(private readonly trackingService: TrackingService) {}

	@Get("wagon/:wagonNumber")
	@RequireAny(Permission.TRACKING_READ)
	@ApiOkResponse({ type: TrackWagonResponseDto })
	@ApiUnauthorizedResponse()
	@ApiNotFoundResponse()
	async trackWagon(@Param("wagonNumber") wagonNumber: string) {
		return this.trackingService.trackWagon(wagonNumber);
	}

	@Get("train/:trainNumber")
	@RequireAny(Permission.TRACKING_READ)
	@ApiOkResponse({ type: TrackTrainResponseDto })
	@ApiUnauthorizedResponse()
	@ApiNotFoundResponse()
	async trackTrain(@Param("trainNumber") trainNumber: string) {
		return this.trackingService.trackTrain(trainNumber);
	}

	@Get("order/:orderId")
	@RequireAny(Permission.TRACKING_READ)
	@ApiOkResponse({ type: [TrackOrderResponseDto] })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async trackOrder(
		@Param("orderId") orderId: number,
		@Request() req: AuthRequest,
	) {
		return this.trackingService.trackOrder(orderId, req.user);
	}

	@Post("wagon/:id/position")
	@RequireAny(Permission.TRACKING_UPDATE)
	@ApiOkResponse({ type: UpdatePositionResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async updateWagonPosition(
		@Param("id", WagonIdPipe) id: WagonId,
		@Body() dto: UpdateWagonPositionDto,
	) {
		return this.trackingService.updateWagonPosition(id, dto);
	}

	@Post("train/:id/position")
	@RequireAny(Permission.TRACKING_UPDATE)
	@ApiOkResponse({ type: UpdatePositionResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async updateTrainPosition(
		@Param("id", TrainIdPipe) id: TrainId,
		@Body() dto: UpdateTrainPositionDto,
	) {
		return this.trackingService.updateTrainPosition(id, dto);
	}
}
