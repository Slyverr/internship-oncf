import { Injectable, NotFoundException } from "@nestjs/common";
import { customers } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll() {
		return this.drizzle.db.query.customers.findMany();
	}

	async findOne(id: CustomerId) {
		const customer = await this.drizzle.db.query.customers.findFirst({
			where: { id },
		});
		if (!customer) throw new NotFoundException(`Customer ${id} not found`);
		return customer;
	}

	async create(dto: CreateCustomerDto) {
		const [customer] = await withDbErrorHandling(
			() => this.drizzle.db.insert(customers).values(dto).returning(),
			dto,
		);
		return customer;
	}

	async update(id: CustomerId, dto: UpdateCustomerDto) {
		const [customer] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(customers)
					.set(dto)
					.where(eq(customers.id, id))
					.returning(),
			dto,
		);

		return customer;
	}

	async remove(id: CustomerId) {
		const [customer] = await this.drizzle.db
			.update(customers)
			.set({ isActive: false })
			.where(eq(customers.id, id))
			.returning();

		if (!customer) {
			throw new NotFoundException(`Customer ${id} not found`);
		}

		return customer;
	}
}
