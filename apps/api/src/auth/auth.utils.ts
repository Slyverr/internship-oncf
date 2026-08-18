import { Permission } from "@ecommand/shared";
import { AuthUser } from "./auth.types";

export function hasOnePermission(
	user: AuthUser,
	permission: Permission,
): boolean {
	if (user.permissions.has(permission)) {
		return true;
	}

	const [module] = permission.split(":");
	return user.permissions.has(`${module}:manage` as Permission);
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
