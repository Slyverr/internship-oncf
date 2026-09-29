import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { canAccessCustomer, getCustomerScope } from "@/auth/customer-scope";
import { CustomersMapper } from "./customers.mapper";
import { CustomersQuery } from "./customers.query";
import type { CustomerId } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { ListCustomerQueryDto } from "./requests/list-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";

@Injectable()
export class CustomersService {
	constructor(
		private readonly customersQuery: CustomersQuery,
		private readonly customersMapper: CustomersMapper,
	) {}

	async findAll(query: ListCustomerQueryDto, user: AuthUser) {
		const scope = getCustomerScope(user);
		return this.customersQuery.findCustomers(
			query,
			scope === null ? undefined : scope,
		);
	}

	async findOne(id: CustomerId, user?: AuthUser) {
		if (user && !canAccessCustomer(user, id)) {
			throw new ForbiddenException(
				"Customer is outside your assigned portfolio",
			);
		}
		const customer = await this.customersQuery.findCustomer(id);
		return this.ensure(customer, id);
	}

	async findActiveCustomerForRegistration(customerCode: string, ice: string) {
		return this.customersQuery.findActiveCustomerForRegistration(
			customerCode,
			ice,
		);
	}

	async create(dto: CreateCustomerDto) {
		const values = this.customersMapper.toCreate(dto);
		const created = await this.customersQuery.createCustomer(values);
		return this.findOne(created.id);
	}

	async update(id: CustomerId, dto: UpdateCustomerDto, user: AuthUser) {
		await this.findOne(id, user);
		const values = this.customersMapper.toUpdate(dto);
		await this.customersQuery.updateCustomer(id, values);
		return this.findOne(id);
	}

	async deactivate(id: CustomerId) {
		const customer = await this.customersQuery.updateCustomer(id, {
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
