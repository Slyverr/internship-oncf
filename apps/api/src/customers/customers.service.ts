import { Injectable, NotFoundException } from "@nestjs/common";
import { customers } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { toCreate, toUpdate } from "./customers.mapper";
import { customerDetailColumns, customerListColumns } from "./customers.query";
import { CustomerId, CustomerUpdate } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";

@Injectable()
export class CustomersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll() {
		return this.drizzle.db.query.customers.findMany({
			columns: customerListColumns,
		});
	}

	async findOne(id: CustomerId) {
		const customer = await this.drizzle.db.query.customers.findFirst({
			where: { id },
			columns: customerDetailColumns,
		});

		return this.ensure(customer, id);
	}

	async create(dto: CreateCustomerDto) {
		const values = toCreate(dto);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(customers)
					.values(values)
					.returning({ id: customers.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async update(id: CustomerId, dto: UpdateCustomerDto) {
		const values = toUpdate(dto);

		await this.persistUpdate(id, values);

		return this.findOne(id);
	}

	async deactivate(id: CustomerId) {
		const customer = await this.persistUpdate(id, {
			isActive: false,
		});

		return {
			id: customer.id,
		};
	}

	private async persistUpdate(id: CustomerId, values: CustomerUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(customers)
					.set(values)
					.where(eq(customers.id, id))
					.returning({ id: customers.id }),
			values,
		);

		return this.ensure(updated, id);
	}

	private ensure<T>(customer: T | undefined, id: CustomerId): T {
		if (!customer) {
			throw new NotFoundException(`Customer ${id} not found`);
		}

		return customer;
	}
}
