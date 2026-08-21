import { Assert, Equals } from "src/common/utils/type-assertions";
import { CustomerDelete } from "../customers.types";

type _Assertion = Assert<Equals<CustomerDeleteDto, CustomerDelete>>;

export class CustomerDeleteDto implements CustomerDelete {
	id: number;
}
