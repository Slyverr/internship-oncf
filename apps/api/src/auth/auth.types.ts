import { Permission, RolePersona } from "@ecommand/shared";
import { User, UserId } from "@/users/users.types";

export interface LocalAuthRequest {
	user: Omit<User, "password">;
}

export interface AuthRequest {
	user: AuthUser;
}

export interface AuthUser {
	id: UserId;
	email: string;
	role: string;
	/** Operational metadata only; authorization always uses effective permissions. */
	persona?: RolePersona | null;
	permissions: Set<Permission>;
	sessionId: string;

	customerId: number | null;
	agencyId: number | null;
	assignedCustomerIds?: readonly number[];
}
