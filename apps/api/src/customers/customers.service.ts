import { API_ERROR_CODES } from "@ecommand/shared";
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

	async findPortfolioOptions() {
		return this.customersQuery.findPortfolioOptions();
	}

	async findOne(id: CustomerId, user?: AuthUser) {
		if (user && !canAccessCustomer(user, id)) {
			throw new ForbiddenException({
				code: API_ERROR_CODES.CUSTOMER_OUTSIDE_PORTFOLIO,
			});
		}
		const customer = await this.customersQuery.findCustomer(id);
		return this.ensure(customer);
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
		return this.ensure(customer);
	}

	private ensure<T>(customer: T | undefined): T {
		if (!customer) {
			throw new NotFoundException({ code: API_ERROR_CODES.CUSTOMER_NOT_FOUND });
		}
		return customer;
	}
}
