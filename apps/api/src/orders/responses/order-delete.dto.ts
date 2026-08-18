import { Assert, Equals } from "src/common/utils/type-assertions";
import { OrderDelete } from "../orders.types";

type _Assertion = Assert<Equals<OrderDeleteDto, OrderDelete>>;

export class OrderDeleteDto implements OrderDelete {
	id: number;
}
