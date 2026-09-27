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

	if (user.customerId !== null) {
		return user.customerId === order.customerId;
	}

	return user.id === order.createdByUserId;
}
