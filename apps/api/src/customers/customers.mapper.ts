import { Injectable } from "@nestjs/common";
import { CustomerInsert, CustomerUpdate } from "./customers.types";
import { CreateCustomerDto } from "./requests/create-customer.dto";
import { UpdateCustomerDto } from "./requests/update-customer.dto";

@Injectable()
export class CustomersMapper {
	toCreate(dto: CreateCustomerDto): CustomerInsert {
		return {
			...dto,
			isActive: dto.isActive ?? true,
		};
	}

	toUpdate(dto: UpdateCustomerDto): CustomerUpdate {
		return {
			...dto,
		};
	}
}
