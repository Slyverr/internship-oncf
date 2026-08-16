import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const trainsPart = defineRelationsPart(schema, (r) => ({
	trains: {
		trainWagons: r.many.trainWagons({
			from: r.trains.id,
			to: r.trainWagons.trainId,
		}),
		orderWagons: r.many.orderWagons({
			from: r.trains.id,
			to: r.orderWagons.trainId,
		}),
		trainTrackings: r.many.trainTracking({
			from: r.trains.id,
			to: r.trainTracking.trainId,
		}),
		trainCurrentStatuses: r.many.trainCurrentStatus({
			from: r.trains.id,
			to: r.trainCurrentStatus.trainId,
		}),
		programConvois: r.many.programConvoi({
			from: r.trains.id,
			to: r.programConvoi.trainId,
		}),
		trainTrackingArchives: r.many.trainTrackingArchive({
			from: r.trains.id,
			to: r.trainTrackingArchive.trainId,
		}),
	},
}));

const wagonsPart = defineRelationsPart(schema, (r) => ({
	wagons: {
		trainWagons: r.many.trainWagons({
			from: r.wagons.id,
			to: r.trainWagons.wagonId,
		}),
		orderWagons: r.many.orderWagons({
			from: r.wagons.id,
			to: r.orderWagons.wagonId,
		}),
		wagonTrackings: r.many.wagonTracking({
			from: r.wagons.id,
			to: r.wagonTracking.wagonId,
		}),
		wagonCurrentStatuses: r.many.wagonCurrentStatus({
			from: r.wagons.id,
			to: r.wagonCurrentStatus.wagonId,
		}),
		stationPassages: r.many.stationPassages({
			from: r.wagons.id,
			to: r.stationPassages.wagonId,
		}),
		wagonTrackingArchives: r.many.wagonTrackingArchive({
			from: r.wagons.id,
			to: r.wagonTrackingArchive.wagonId,
		}),
	},
}));

const trainWagonsPart = defineRelationsPart(schema, (r) => ({
	trainWagons: {
		train: r.one.trains({
			from: r.trainWagons.trainId,
			to: r.trains.id,
		}),
		wagon: r.one.wagons({
			from: r.trainWagons.wagonId,
			to: r.wagons.id,
		}),
	},
}));

const wagonTrackingPart = defineRelationsPart(schema, (r) => ({
	wagonTracking: {
		wagon: r.one.wagons({
			from: r.wagonTracking.wagonId,
			to: r.wagons.id,
		}),
	},
}));

const trainTrackingPart = defineRelationsPart(schema, (r) => ({
	trainTracking: {
		train: r.one.trains({
			from: r.trainTracking.trainId,
			to: r.trains.id,
		}),
	},
}));

const wagonCurrentStatusPart = defineRelationsPart(schema, (r) => ({
	wagonCurrentStatus: {
		wagon: r.one.wagons({
			from: r.wagonCurrentStatus.wagonId,
			to: r.wagons.id,
		}),
	},
}));

const trainCurrentStatusPart = defineRelationsPart(schema, (r) => ({
	trainCurrentStatus: {
		train: r.one.trains({
			from: r.trainCurrentStatus.trainId,
			to: r.trains.id,
		}),
	},
}));

const stationPassagesPart = defineRelationsPart(schema, (r) => ({
	stationPassages: {
		wagon: r.one.wagons({
			from: r.stationPassages.wagonId,
			to: r.wagons.id,
		}),
		station: r.one.stations({
			from: r.stationPassages.stationId,
			to: r.stations.id,
		}),
	},
}));

const wagonTrackingArchivePart = defineRelationsPart(schema, (r) => ({
	wagonTrackingArchive: {
		wagon: r.one.wagons({
			from: r.wagonTrackingArchive.wagonId,
			to: r.wagons.id,
		}),
	},
}));

const trainTrackingArchivePart = defineRelationsPart(schema, (r) => ({
	trainTrackingArchive: {
		train: r.one.trains({
			from: r.trainTrackingArchive.trainId,
			to: r.trains.id,
		}),
	},
}));

export const trackingRelations = {
	...trainsPart,
	...wagonsPart,
	...trainWagonsPart,
	...wagonTrackingPart,
	...trainTrackingPart,
	...wagonCurrentStatusPart,
	...trainCurrentStatusPart,
	...stationPassagesPart,
	...wagonTrackingArchivePart,
	...trainTrackingArchivePart,
};
