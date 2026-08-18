import { Permission } from "@ecommand/shared";
import { AuthUser } from "./auth.types";

export function hasAllPermissions(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.every((p) => user.permissions.includes(p));
}

export function hasAnyPermission(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.some((p) => user.permissions.includes(p));
}

/** @deprecated Use hasAllPermissions instead */
export const hasPermission = hasAllPermissions;
