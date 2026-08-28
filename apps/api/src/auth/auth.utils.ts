import { Permission } from "@ecommand/shared";
import { PERMISSION_PARENTS } from "@/database/reference-data";
import { AuthUser } from "./auth.types";

export function hasOnePermission(
	user: AuthUser,
	permission: Permission,
): boolean {
	let current: Permission | undefined = permission;

	while (current) {
		if (user.permissions.has(current)) {
			return true;
		}

		current = PERMISSION_PARENTS[current];
	}

	return false;
}

export function hasAllPermissions(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.every((p) => hasOnePermission(user, p));
}

export function hasAnyPermission(
	user: AuthUser,
	...permissions: Permission[]
): boolean {
	return permissions.some((p) => hasOnePermission(user, p));
}

/** @deprecated Use hasOnePermission instead */
export const hasPermission = hasOnePermission;
