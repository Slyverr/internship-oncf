import { API_ERROR_CODES, Permission } from "@ecommand/shared";
import { Injectable, NotFoundException, Optional } from "@nestjs/common";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
import { UpdateTrainPositionDto } from "./requests/update-train-position.dto";
import { UpdateWagonPositionDto } from "./requests/update-wagon-position.dto";
import { TrackingQuery } from "./tracking.query";
import type { TrainId, WagonId } from "./tracking.types";

@Injectable()
export class TrackingService {
	constructor(
		private readonly trackingQuery: TrackingQuery,
		@Optional() private readonly realtimeEvents?: RealtimeEventsService,
	) {}

	async trackWagon(wagonNumber: string) {
		const wagon = await this.trackingQuery.findTrackedWagon(wagonNumber);
		if (!wagon) {
			throw new NotFoundException({
				code: API_ERROR_CODES.TRACKED_WAGON_NOT_FOUND,
			});
		}
		return wagon;
	}

	async trackTrain(trainNumber: string) {
		const train = await this.trackingQuery.findTrackedTrain(trainNumber);
		if (!train) {
			throw new NotFoundException({
				code: API_ERROR_CODES.TRACKED_TRAIN_NOT_FOUND,
			});
		}
		return train;
	}

	async trackOrder(orderId: number) {
		return this.trackingQuery.findTrackedOrder(orderId);
	}

	async updateWagonPosition(id: WagonId, dto: UpdateWagonPositionDto) {
		const wagon = await this.trackingQuery.findWagonExists(id);
		if (!wagon) {
			throw new NotFoundException({
				code: API_ERROR_CODES.TRACKED_WAGON_NOT_FOUND,
			});
		}

		const tracking = await this.trackingQuery.createWagonTracking({
			wagonId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
			...(dto.recordedAt && { recordedAt: dto.recordedAt }),
		});
		this.publishChanged();
		return tracking;
	}

	async updateWagonPositionByNumber(
		wagonNumber: string,
		dto: UpdateWagonPositionDto,
		integrationCredentialId?: number,
	) {
		const wagon = await this.trackingQuery.findWagonIdByNumber(wagonNumber);
		if (!wagon) {
			throw new NotFoundException({
				code: API_ERROR_CODES.TRACKED_WAGON_NOT_FOUND,
			});
		}
		if (integrationCredentialId === undefined) {
			return this.updateWagonPosition(wagon.id, dto);
		}
		const tracking = await this.trackingQuery.createWagonTracking({
			wagonId: wagon.id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
			source: "INTEGRATION",
			integrationCredentialId,
			...(dto.recordedAt && { recordedAt: dto.recordedAt }),
		});
		this.publishChanged();
		return tracking;
	}

	async updateTrainPosition(id: TrainId, dto: UpdateTrainPositionDto) {
		const train = await this.trackingQuery.findTrainExists(id);
		if (!train) {
			throw new NotFoundException({
				code: API_ERROR_CODES.TRACKED_TRAIN_NOT_FOUND,
			});
		}

		const tracking = await this.trackingQuery.updateTrainPosition(id, {
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		});
		this.publishChanged();
		return tracking;
	}

	private publishChanged() {
		this.realtimeEvents?.publishToPermission(
			Permission.TRACKING_READ,
			REALTIME_EVENT_TYPES.trackingChanged,
		);
	}
}
