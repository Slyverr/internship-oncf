import { Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@/database/drizzle.service";
import { UpdateTrainPositionDto } from "./requests/update-train-position.dto";
import { UpdateWagonPositionDto } from "./requests/update-wagon-position.dto";
import {
	createTrainTracking,
	createWagonTracking,
	findTrackedOrder,
	findTrackedTrain,
	findTrackedWagon,
	findTrainExists,
	findWagonExists,
	updateTrainStatus,
} from "./tracking.query";
import type { TrainId, WagonId } from "./tracking.types";

@Injectable()
export class TrackingService {
	constructor(private readonly drizzle: DrizzleService) {}

	async trackWagon(wagonNumber: string) {
		const wagon = await findTrackedWagon(this.drizzle.db, wagonNumber);
		if (!wagon) {
			throw new NotFoundException(`Wagon ${wagonNumber} not found`);
		}

		return wagon;
	}

	async trackTrain(trainNumber: string) {
		const train = await findTrackedTrain(this.drizzle.db, trainNumber);
		if (!train) {
			throw new NotFoundException(`Train ${trainNumber} not found`);
		}

		return train;
	}

	async trackOrder(orderId: number) {
		return findTrackedOrder(this.drizzle.db, orderId);
	}

	async updateWagonPosition(id: WagonId, dto: UpdateWagonPositionDto) {
		const wagon = await findWagonExists(this.drizzle.db, id);
		if (!wagon) {
			throw new NotFoundException(`Wagon ${id} not found`);
		}

		return createWagonTracking(this.drizzle.db, {
			wagonId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		});
	}

	async updateTrainPosition(id: TrainId, dto: UpdateTrainPositionDto) {
		const train = await findTrainExists(this.drizzle.db, id);
		if (!train) {
			throw new NotFoundException(`Train ${id} not found`);
		}

		const values = {
			trainId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		};

		return this.drizzle.db.transaction(async (tx) => {
			const position = await createTrainTracking(tx, values);
			await updateTrainStatus(tx, id, values.status);

			return position;
		});
	}
}
