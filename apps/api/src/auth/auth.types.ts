import { Permission, Role } from "@ecommand/shared";
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
	role: Role;
	permissions: Set<Permission>;
	sessionId: string;

	customerId: number | null;
	agencyId: number | null;
}
