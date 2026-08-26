import { Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@/database/drizzle.service";
import { toCreate, toUpdate } from "./customers.mapper";
import {
	createCustomer,
	findCustomer,
	findCustomers,
	updateCustomer,
} from "./customers.query";
import type { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { ListCustomerQueryDto } from "./requests/list-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";

@Injectable()
export class CustomersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll(query: ListCustomerQueryDto) {
		return findCustomers(this.drizzle.db, query);
	}

	async findOne(id: CustomerId) {
		return this.ensure(await findCustomer(this.drizzle.db, id), id);
	}

	async create(dto: CreateCustomerDto) {
		const created = await createCustomer(this.drizzle.db, toCreate(dto));
		return this.findOne(created.id);
	}

	async update(id: CustomerId, dto: UpdateCustomerDto) {
		await updateCustomer(this.drizzle.db, id, toUpdate(dto));
		return this.findOne(id);
	}

	async deactivate(id: CustomerId) {
		const customer = await updateCustomer(this.drizzle.db, id, {
			isActive: false,
		});

		return this.ensure(customer, id);
	}

	private ensure<T>(customer: T | undefined, id: CustomerId): T {
		if (!customer) {
			throw new NotFoundException(`Customer ${id} not found`);
		}

		return customer;
	}
}
