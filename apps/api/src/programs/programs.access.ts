import type { AuthUser } from "@/auth/auth.types";

export interface ProgramAccessRecord {
	createdByUserId: number;
	order?: { customerId: number } | null;
}

export function canAccessProgram(
	program: ProgramAccessRecord | undefined,
	user: AuthUser,
): boolean | undefined {
	if (!program) return undefined;

	if (user.customerId !== null) {
		return program.order?.customerId === user.customerId;
	}

	return program.createdByUserId === user.id;
}
