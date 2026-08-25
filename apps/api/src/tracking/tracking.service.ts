import { Injectable, NotFoundException } from "@nestjs/common";
import { trains, trainTracking, wagonTracking } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/database/drizzle.service";
import { withDbErrorHandling } from "src/database/drizzle.util";
import { UpdateTrainPositionDto } from "./requests/update-train-position.dto";
import { UpdateWagonPositionDto } from "./requests/update-wagon-position.dto";
import {
	trackOrderColumns,
	trackOrderRelations,
	trackTrainColumns,
	trackTrainRelations,
	trackWagonColumns,
	trackWagonRelations,
} from "./tracking.query";
import type { TrainId, WagonId } from "./tracking.types";

@Injectable()
export class TrackingService {
	constructor(private readonly drizzle: DrizzleService) {}

	async trackWagon(wagonNumber: string) {
		const wagon = await this.drizzle.db.query.wagons.findFirst({
			where: { wagonNumber },
			columns: trackWagonColumns,
			with: trackWagonRelations,
		});

		if (!wagon) {
			throw new NotFoundException(`Wagon ${wagonNumber} not found`);
		}

		return wagon;
	}

	async trackTrain(trainNumber: string) {
		const train = await this.drizzle.db.query.trains.findFirst({
			where: { trainNumber },
			columns: trackTrainColumns,
			with: trackTrainRelations,
		});

		if (!train) {
			throw new NotFoundException(`Train ${trainNumber} not found`);
		}

		return train;
	}

	async trackOrder(orderId: number) {
		return this.drizzle.db.query.orderWagons.findMany({
			where: { orderId },
			columns: trackOrderColumns,
			with: trackOrderRelations,
		});
	}

	async updateWagonPosition(id: WagonId, dto: UpdateWagonPositionDto) {
		const wagon = await this.drizzle.db.query.wagons.findFirst({
			where: { id },
			columns: { id: true },
		});

		if (!wagon) {
			throw new NotFoundException(`Wagon ${id} not found`);
		}

		const values = {
			wagonId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		};

		const [position] = await withDbErrorHandling(
			() => this.drizzle.db.insert(wagonTracking).values(values).returning(),
			values,
		);

		return position;
	}

	async updateTrainPosition(id: TrainId, dto: UpdateTrainPositionDto) {
		const train = await this.drizzle.db.query.trains.findFirst({
			where: { id },
			columns: { id: true },
		});

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
			const [position] = await withDbErrorHandling(
				() => tx.insert(trainTracking).values(values).returning(),
				values,
			);

			await tx
				.update(trains)
				.set({
					status: values.status,
				})
				.where(eq(trains.id, id));

			return position;
		});
	}
}
