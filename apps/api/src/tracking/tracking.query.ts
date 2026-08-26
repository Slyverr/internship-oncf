import { trains, trainTracking, wagonTracking } from "drizzle/schema";
import { eq } from "drizzle-orm";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type {
	TrainId,
	TrainTrackingInsert,
	WagonId,
	WagonTrackingInsert,
} from "./tracking.types";

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

export async function findTrackedWagon(db: DrizzleDb, wagonNumber: string) {
	return db.query.wagons.findFirst({
		where: { wagonNumber },
		columns: trackWagonColumns,
		with: trackWagonRelations,
	});
}

export async function findTrackedTrain(db: DrizzleDb, trainNumber: string) {
	return db.query.trains.findFirst({
		where: { trainNumber },
		columns: trackTrainColumns,
		with: trackTrainRelations,
	});
}

export async function findTrackedOrder(db: DrizzleDb, orderId: number) {
	return db.query.orderWagons.findMany({
		where: { orderId },
		columns: trackOrderColumns,
		with: trackOrderRelations,
	});
}

export async function findTrainExists(db: DrizzleDb, id: TrainId) {
	return db.query.trains.findFirst({
		where: { id },
		columns: { id: true },
	});
}

export async function findWagonExists(db: DrizzleDb, id: WagonId) {
	return db.query.wagons.findFirst({
		where: { id },
		columns: { id: true },
	});
}

export async function createTrainTracking(
	db: DrizzleDb,
	values: TrainTrackingInsert,
) {
	const [position] = await withDbErrorHandling(
		() => db.insert(trainTracking).values(values).returning(),
		values,
	);

	return position;
}

export async function createWagonTracking(
	db: DrizzleDb,
	values: WagonTrackingInsert,
) {
	const [position] = await withDbErrorHandling(
		() => db.insert(wagonTracking).values(values).returning(),
		values,
	);

	return position;
}

export async function updateTrainStatus(
	db: DrizzleDb,
	id: TrainId,
	status: string,
) {
	return db.update(trains).set({ status }).where(eq(trains.id, id));
}
