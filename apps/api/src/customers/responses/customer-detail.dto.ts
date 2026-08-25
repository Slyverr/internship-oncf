import { Assert, Equals } from "@/common/utils/type-assertions";
import { CustomerDetail } from "../customers.types";

type _Assertion = Assert<Equals<CustomerDetailDto, CustomerDetail>>;

export class CustomerDetailDto implements CustomerDetail {
	id: number;
	companyName: string;
	address: string | null;
	city: string | null;
	phone: string | null;
	email: string | null;
	typeId: number | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	customerCode: string | null;
}
