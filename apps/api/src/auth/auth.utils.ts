import {
	Permission,
	hasOnePermission as sharedHasOnePermission,
} from "@ecommand/shared";
import { AuthUser } from "./auth.types";

export function hasOnePermission(
	user: AuthUser,
	permission: Permission,
): boolean {
	return sharedHasOnePermission(user.permissions, permission);
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
