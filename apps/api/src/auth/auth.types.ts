import { Permission } from "@ecommand/shared";
import { User, UserId } from "src/users/users.types";

export interface LocalAuthRequest {
	user: Omit<User, "password">;
}

export interface AuthRequest {
	user: AuthUser;
}

export interface AuthUser {
	id: UserId;
	email: string;
	permissions: Set<Permission>;
	role?: string;
}
