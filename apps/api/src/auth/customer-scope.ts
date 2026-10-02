import { Permission } from "@ecommand/shared";
import type { AuthUser } from "./auth.types";
import { hasOnePermission } from "./auth.utils";

export function getCustomerScope(user: AuthUser): readonly number[] | null {
	if (user.assignedCustomerIds?.length) return user.assignedCustomerIds;
	if (hasOnePermission(user, Permission.CUSTOMERS_MANAGE_OTHER)) return null;
	if (user.customerId !== null) return [user.customerId];
	if (user.assignedCustomerIds !== undefined) return [];
	return null;
}

export function canAccessCustomer(user: AuthUser, customerId: number): boolean {
	const scope = getCustomerScope(user);
	return scope === null || scope.includes(customerId);
}
