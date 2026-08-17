import { orders } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { OrdersService } from "./orders.service";

export type Order = InferSelectModel<typeof orders>;
export type OrderInsert = InferInsertModel<typeof orders>;
export type OrderUpdate = Partial<OrderInsert>;

export type OrderId = Order["id"];

export type OrderList = Awaited<ReturnType<OrdersService["findAll"]>>[number];
export type OrderDetail = NonNullable<
	Awaited<ReturnType<OrdersService["findOne"]>>
>;
export type OrderDelete = NonNullable<
	Awaited<ReturnType<OrdersService["remove"]>>
>;
