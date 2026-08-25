import { Assert, Equals } from "@/common/utils/type-assertions";
import { CustomerList } from "../customers.types";

type _Assertion = Assert<Equals<CustomerListDto, CustomerList>>;

export class CustomerListDto implements CustomerList {
	id: number;
	createdAt: string;
	isActive: boolean;
	updatedAt: string;
	companyName: string;
	address: string | null;
	city: string | null;
	phone: string | null;
	email: string | null;
	typeId: number | null;
	customerCode: string | null;
}
