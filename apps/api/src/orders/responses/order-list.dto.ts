import { Assert, Equals } from "@/common/utils/type-assertions";
import { OrderList } from "../orders.types";

type _Assertion = Assert<Equals<OrderListDto, OrderList>>;

export class OrderListDto implements OrderList {
	id: number;
	createdAt: string;
	orderNumber: string;
	quantityDemanded: string;
	quantityAchieved: string | null;
	orderDate: string;
	startDate: string | null;
	endDate: string | null;
	orderStatus: { id: number; name: string } | null;
	unit: { name: string } | null;
	customer: { id: number; companyName: string } | null;
	good: { id: number; name: string } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
}
