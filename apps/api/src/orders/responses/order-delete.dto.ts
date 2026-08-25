import { Assert, Equals } from "@/common/utils/type-assertions";
import { OrderDelete } from "../orders.types";

type _Assertion = Assert<Equals<OrderDeleteDto, OrderDelete>>;

export class OrderDeleteDto implements OrderDelete {
	id: number;
}
