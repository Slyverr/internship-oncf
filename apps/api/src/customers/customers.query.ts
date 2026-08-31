import { Injectable } from "@nestjs/common";
import { customers } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type {
	CustomerId,
	CustomerInsert,
	CustomerUpdate,
} from "./customers.types";
import { ListCustomerQueryDto } from "./requests/list-customer.dto";

type CustomersColumns = QueryColumns<"customers">;

const customerListColumns = {
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

@Injectable()
export class CustomersQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findCustomers(query: ListCustomerQueryDto) {
		const {
			page = 1,
			limit = 20,
			search,
			typeId,
			isActive,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = query;

		return this.drizzle.db.query.customers.findMany({
			where: {
				...(typeId !== undefined && { typeId }),
				...(isActive !== undefined && { isActive }),
				...(search && {
					OR: [
						{
							companyName: {
								ilike: `%${search}%`,
							},
						},
						{
							customerCode: {
								ilike: `%${search}%`,
							},
						},
						{
							city: {
								ilike: `%${search}%`,
							},
						},
						{
							email: {
								ilike: `%${search}%`,
							},
						},
						{
							phone: {
								ilike: `%${search}%`,
							},
						},
					],
				}),
			},
			columns: customerListColumns,
			orderBy: {
				[sortBy]: sortOrder,
			},
			limit,
			offset: (page - 1) * limit,
		});
	}

	async findCustomer(id: CustomerId) {
		return this.drizzle.db.query.customers.findFirst({
			where: { id },
			columns: customerListColumns,
		});
	}

	async createCustomer(values: CustomerInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(customers)
					.values(values)
					.returning({ id: customers.id }),
			values,
		);
		return created;
	}

	async updateCustomer(id: CustomerId, values: CustomerUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(customers)
					.set(values)
					.where(eq(customers.id, id))
					.returning({ id: customers.id }),
			values,
		);
		return updated;
	}
}
