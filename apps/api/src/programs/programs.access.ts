import { Permission } from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";

export interface ProgramAccessRecord {
	createdByUserId: number;
	order?: { customerId: number } | null;
}

export function canAccessProgram(
	program: ProgramAccessRecord | undefined,
	user: AuthUser,
): boolean | undefined {
	if (!program) return undefined;

	const customerScope = getCustomerScope(user);
	if (customerScope !== null) {
		return !!program.order && customerScope.includes(program.order.customerId);
	}

	return (
		hasOnePermission(user, Permission.PROGRAMS_MANAGE_OTHER) ||
		program.createdByUserId === user.id
	);
}
