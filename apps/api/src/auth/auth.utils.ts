import { Permission } from "src/db/reference-data";
import { AuthUser } from "./auth.types";

export function hasPermission(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.every((p) => user.permissions.includes(p));
}
