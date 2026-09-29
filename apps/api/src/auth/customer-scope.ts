import { Role } from "@ecommand/shared";
import type { AuthUser } from "./auth.types";

export function getCustomerScope(user: AuthUser): readonly number[] | null {
	if (user.role === Role.ADMIN) return null;
	if (user.role === Role.AGENT_COMMERCIAL) {
		return user.assignedCustomerIds ?? [];
	}
	if (user.customerId !== null) return [user.customerId];
	return null;
}

export function canAccessCustomer(user: AuthUser, customerId: number): boolean {
	const scope = getCustomerScope(user);
	return scope === null || scope.includes(customerId);
}
