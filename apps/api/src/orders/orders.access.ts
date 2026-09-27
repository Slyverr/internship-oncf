import type { AuthUser } from "@/auth/auth.types";

export interface OrderAccessRecord {
	customerId: number;
	createdByUserId: number;
}

export function canAccessOrder(
	order: OrderAccessRecord | undefined,
	user: AuthUser,
): boolean | undefined {
	if (!order) return undefined;

	return (
		user.customerId === order.customerId || user.id === order.createdByUserId
	);
}
