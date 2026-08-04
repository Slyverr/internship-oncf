import { customers } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Customer = InferSelectModel<typeof customers>;

export type CustomerId = Customer["id"];
