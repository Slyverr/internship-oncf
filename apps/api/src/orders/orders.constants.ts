import { OrderStatus } from "@ecommand/shared";
import { ORDER_STATUSES } from "src/db/reference-data";

export const ORDER_TRANSITION: Record<OrderStatus, OrderStatus[]> = {
	[OrderStatus.DRAFT]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],

	[OrderStatus.SUBMITTED]: [OrderStatus.APPROVED, OrderStatus.REJECTED],

	[OrderStatus.APPROVED]: [OrderStatus.SENT_TO_DTM],

	[OrderStatus.SENT_TO_DTM]: [OrderStatus.IN_PROGRESS],

	[OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],

	[OrderStatus.PARTIALLY_EXECUTED]: [],
	[OrderStatus.COMPLETED]: [],
	[OrderStatus.CANCELLED]: [],
	[OrderStatus.REJECTED]: [],
};

export const ORDER_STATUS_BY_ID = Object.fromEntries(
	Object.entries(ORDER_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, OrderStatus>;
