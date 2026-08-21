import { customers } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { CustomersService } from "./customers.service";

export type Customer = InferSelectModel<typeof customers>;
export type CustomerInsert = InferInsertModel<typeof customers>;
export type CustomerUpdate = Partial<CustomerInsert>;

export type CustomerId = Customer["id"];

export type CustomerList = Awaited<
	ReturnType<CustomersService["findAll"]>
>[number];

export type CustomerDetail = NonNullable<
	Awaited<ReturnType<CustomersService["findOne"]>>
>;

export type CustomerDelete = NonNullable<
	Awaited<ReturnType<CustomersService["deactivate"]>>
>;
