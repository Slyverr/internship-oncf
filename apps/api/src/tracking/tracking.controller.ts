import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import { UpdateTrainPositionDto } from "./dto/update-train-position.dto";
import { UpdateWagonPositionDto } from "./dto/update-wagon-position.dto";
import { TrackingOwnershipGuard } from "./guards/tracking-ownership.guard";
import { TrainIdPipe } from "./pipes/train-id.pipe";
import { WagonIdPipe } from "./pipes/wagon-id.pipe";
import { TrackingService } from "./tracking.service";
import type { TrainId, WagonId } from "./tracking.types";

@Controller("tracking")
export class TrackingController {
	constructor(private readonly trackingService: TrackingService) {}

	@Get("wagon/:wagonNumber")
	@Permissions(Permission.TRACKING_READ)
	async trackWagon(@Param("wagonNumber") wagonNumber: string) {
		return this.trackingService.trackWagon(wagonNumber);
	}

	@Get("train/:trainNumber")
	@Permissions(Permission.TRACKING_READ)
	async trackTrain(@Param("trainNumber") trainNumber: string) {
		return this.trackingService.trackTrain(trainNumber);
	}

	@Get("order/:orderId")
	@Permissions(Permission.TRACKING_READ)
	@UseGuards(TrackingOwnershipGuard)
	async trackOrder(
		@Param("orderId") orderId: number,
		@Request() req: AuthRequest,
	) {
		return this.trackingService.trackOrder(orderId, req.user);
	}

	@Post("wagon/:id/position")
	@Permissions(Permission.TRACKING_UPDATE)
	async updateWagonPosition(
		@Param("id", WagonIdPipe) id: WagonId,
		@Body() dto: UpdateWagonPositionDto,
	) {
		return this.trackingService.updateWagonPosition(id, dto);
	}

	@Post("train/:id/position")
	@Permissions(Permission.TRACKING_UPDATE)
	async updateTrainPosition(
		@Param("id", TrainIdPipe) id: TrainId,
		@Body() dto: UpdateTrainPositionDto,
	) {
		return this.trackingService.updateTrainPosition(id, dto);
	}
}
