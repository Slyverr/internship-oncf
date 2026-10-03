import { ORDER_TRANSITIONS, OrderStatus } from "@ecommand/shared";
import { ORDER_STATUSES } from "@/database/reference-data";

export { ORDER_TRANSITIONS as ORDER_TRANSITION };

export const ORDER_STATUS_BY_ID = Object.fromEntries(
	Object.entries(ORDER_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, OrderStatus>;

export const ORDER_QUANTITY_PATTERN = /^\d+(\.\d{1,3})?$/;
