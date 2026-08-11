import { wagons, trains } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Wagon = InferSelectModel<typeof wagons>;
export type Train = InferSelectModel<typeof trains>;
export type WagonId = Wagon["id"];
export type TrainId = Train["id"];
