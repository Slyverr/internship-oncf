import { orders } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Order = InferSelectModel<typeof orders>;

export type OrderId = Order["id"];
