import { OrderList } from "../orders.types";

export class OrderListDto implements OrderList {
	id: number;
	createdAt: string;
	orderNumber: string | null;
	quantityDemanded: string;
	quantityAchieved: string | null;
	orderDate: string;
	startDate: string | null;
	endDate: string | null;
	orderStatus: { id: number; name: string } | null;
	unit: { name: string } | null;
	customer: { id: number; companyName: string } | null;
	user: { id: number; lastName: string; firstName: string } | null;
	good: { id: number; name: string } | null;
}
