import { QueryColumns, QueryRelations } from "src/database/drizzle.types";

type TrainsColumns = QueryColumns<"trains">;
type WagonsColumns = QueryColumns<"wagons">;
type OrderWagonsColumns = QueryColumns<"orderWagons">;

type TrainsRelations = QueryRelations<"trains">;
type WagonsRelations = QueryRelations<"wagons">;
type OrderWagonsRelations = QueryRelations<"orderWagons">;

export const trackTrainColumns = {
	id: true,
	externalId: true,
	trainNumber: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	isActive: true,
} satisfies TrainsColumns;

export const trackTrainRelations = {
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

export const trackWagonColumns = {
	id: true,
	externalId: true,
	wagonNumber: true,
	type: true,
	capacity: true,
	createdAt: true,
	updatedAt: true,
	isActive: true,
} satisfies WagonsColumns;

export const trackWagonRelations = {
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

export const trackOrderColumns = {
	orderId: true,
	wagonId: true,
} satisfies OrderWagonsColumns;

export const trackOrderRelations = {
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
