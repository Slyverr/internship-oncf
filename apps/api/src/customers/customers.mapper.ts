import { CustomerInsert, CustomerUpdate } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";

export const toCreate = (dto: CreateCustomerDto): CustomerInsert => {
	return {
		...dto,
		isActive: dto.isActive ?? true,
	};
};

export const toUpdate = (dto: UpdateCustomerDto): CustomerUpdate => {
	return {
		...dto,
	};
};
