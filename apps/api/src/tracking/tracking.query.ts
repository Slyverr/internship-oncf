import { Injectable } from "@nestjs/common";
import { trains, trainTracking, wagonTracking } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { TrainId, WagonId, WagonTrackingInsert } from "./tracking.types";

type TrainsColumns = QueryColumns<"trains">;
type WagonsColumns = QueryColumns<"wagons">;
type OrderWagonsColumns = QueryColumns<"orderWagons">;

type TrainsRelations = QueryRelations<"trains">;
type WagonsRelations = QueryRelations<"wagons">;
type OrderWagonsRelations = QueryRelations<"orderWagons">;

const trackTrainColumns = {
	id: true,
	externalId: true,
	trainNumber: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	isActive: true,
} satisfies TrainsColumns;

const trackTrainRelations = {
	trainTrackings: {
		columns: {
			id: true,
			trainId: true,
			latitude: true,
			longitude: true,
			status: true,
			recordedAt: true,
		},
		orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
		limit: 1,
	},
} satisfies TrainsRelations;

const trackWagonColumns = {
	id: true,
	externalId: true,
	wagonNumber: true,
	type: true,
	capacity: true,
	createdAt: true,
	updatedAt: true,
	isActive: true,
} satisfies WagonsColumns;

const trackWagonRelations = {
	wagonTrackings: {
		columns: {
			id: true,
			wagonId: true,
			latitude: true,
			longitude: true,
			status: true,
			recordedAt: true,
		},
		orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
		limit: 1,
	},
} satisfies WagonsRelations;

const trackOrderColumns = {
	orderId: true,
	wagonId: true,
} satisfies OrderWagonsColumns;

const trackOrderRelations = {
	wagon: {
		columns: {
			id: true,
			wagonNumber: true,
		},
		with: {
			wagonTrackings: {
				columns: {
					id: true,
					wagonId: true,
					latitude: true,
					longitude: true,
					status: true,
					recordedAt: true,
				},
				orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
				limit: 1,
			},
		},
	},
} satisfies OrderWagonsRelations;

@Injectable()
export class TrackingQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findTrackedWagon(wagonNumber: string) {
		return this.drizzle.db.query.wagons.findFirst({
			where: { wagonNumber },
			columns: trackWagonColumns,
			with: trackWagonRelations,
		});
	}

	async findTrackedTrain(trainNumber: string) {
		return this.drizzle.db.query.trains.findFirst({
			where: { trainNumber },
			columns: trackTrainColumns,
			with: trackTrainRelations,
		});
	}

	async findTrackedOrder(orderId: number) {
		return this.drizzle.db.query.orderWagons.findMany({
			where: { orderId },
			columns: trackOrderColumns,
			with: trackOrderRelations,
		});
	}

	async findTrainExists(id: TrainId) {
		return this.drizzle.db.query.trains.findFirst({
			where: { id },
			columns: { id: true },
		});
	}

	async findWagonExists(id: WagonId) {
		return this.drizzle.db.query.wagons.findFirst({
			where: { id },
			columns: { id: true },
		});
	}

	async createWagonTracking(values: WagonTrackingInsert) {
		const [position] = await withDbErrorHandling(
			() => this.drizzle.db.insert(wagonTracking).values(values).returning(),
			values,
		);
		return position;
	}

	// Handles the entire transaction for updating train position
	async updateTrainPosition(
		id: TrainId,
		dto: { latitude: string; longitude: string; status: string },
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const [position] = await withDbErrorHandling(
				() =>
					tx
						.insert(trainTracking)
						.values({
							trainId: id,
							latitude: dto.latitude,
							longitude: dto.longitude,
							status: dto.status,
						})
						.returning(),
				dto,
			);

			await tx
				.update(trains)
				.set({ status: dto.status })
				.where(eq(trains.id, id));

			return position;
		});
	}
}
