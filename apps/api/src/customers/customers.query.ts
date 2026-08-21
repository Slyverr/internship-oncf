import { QueryColumns } from "src/db/drizzle.types";

type CustomersColumns = QueryColumns<"customers">;

export const customerListColumns = {
	id: true,
	companyName: true,
	address: true,
	city: true,
	phone: true,
	email: true,
	typeId: true,
	customerCode: true,
	isActive: true,
	createdAt: true,
	updatedAt: true,
} satisfies CustomersColumns;

export const customerDetailColumns = customerListColumns;
