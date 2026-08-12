import { Permission } from "@ecommand/shared";
import { AuthUser } from "./auth.types";

export function hasPermission(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.every((p) => user.permissions.includes(p));
}
