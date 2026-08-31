import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateTrainPositionDto } from "./requests/update-train-position.dto";
import { UpdateWagonPositionDto } from "./requests/update-wagon-position.dto";
import { TrackingQuery } from "./tracking.query";
import type { TrainId, WagonId } from "./tracking.types";

@Injectable()
export class TrackingService {
	constructor(private readonly trackingQuery: TrackingQuery) {}

	async trackWagon(wagonNumber: string) {
		const wagon = await this.trackingQuery.findTrackedWagon(wagonNumber);
		if (!wagon) {
			throw new NotFoundException(`Wagon ${wagonNumber} not found`);
		}
		return wagon;
	}

	async trackTrain(trainNumber: string) {
		const train = await this.trackingQuery.findTrackedTrain(trainNumber);
		if (!train) {
			throw new NotFoundException(`Train ${trainNumber} not found`);
		}
		return train;
	}

	async trackOrder(orderId: number) {
		return this.trackingQuery.findTrackedOrder(orderId);
	}

	async updateWagonPosition(id: WagonId, dto: UpdateWagonPositionDto) {
		const wagon = await this.trackingQuery.findWagonExists(id);
		if (!wagon) {
			throw new NotFoundException(`Wagon ${id} not found`);
		}

		return this.trackingQuery.createWagonTracking({
			wagonId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		});
	}

	async updateTrainPosition(id: TrainId, dto: UpdateTrainPositionDto) {
		const train = await this.trackingQuery.findTrainExists(id);
		if (!train) {
			throw new NotFoundException(`Train ${id} not found`);
		}

		return this.trackingQuery.updateTrainPosition(id, {
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		});
	}
}
