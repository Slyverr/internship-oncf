import { orders } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import { OrdersService } from "./orders.service";

export type Order = InferSelectModel<typeof orders>;

export type OrderId = Order["id"];

export type OrderList = Awaited<ReturnType<OrdersService["findAll"]>>[number];
export type OrderDetail = NonNullable<
	Awaited<ReturnType<OrdersService["findOne"]>>
>;
