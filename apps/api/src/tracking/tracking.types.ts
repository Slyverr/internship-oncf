import { trains, trainTracking, wagons, wagonTracking } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { TrackingService } from "./tracking.service";

export type Wagon = InferSelectModel<typeof wagons>;
export type Train = InferSelectModel<typeof trains>;

export type WagonTrackingInsert = InferInsertModel<typeof wagonTracking>;
export type TrainTrackingInsert = InferInsertModel<typeof trainTracking>;

export type WagonId = Wagon["id"];
export type TrainId = Train["id"];

export type TrackWagon = Awaited<ReturnType<TrackingService["trackWagon"]>>;

export type TrackTrain = Awaited<ReturnType<TrackingService["trackTrain"]>>;

export type TrackOrder = Awaited<
	ReturnType<TrackingService["trackOrder"]>
>[number];

export type WagonPosition = Awaited<
	ReturnType<TrackingService["updateWagonPosition"]>
>;

export type TrainPosition = Awaited<
	ReturnType<TrackingService["updateTrainPosition"]>
>;
