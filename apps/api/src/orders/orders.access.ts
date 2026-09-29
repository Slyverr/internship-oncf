import { Permission } from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";

export interface OrderAccessRecord {
	customerId: number;
	createdByUserId: number;
}

export function canAccessOrder(
	order: OrderAccessRecord | undefined,
	user: AuthUser,
): boolean | undefined {
	if (!order) return undefined;

	const customerScope = getCustomerScope(user);
	if (customerScope !== null) {
		return customerScope.includes(order.customerId);
	}

	return (
		hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER) ||
		order.createdByUserId === user.id
	);
}
