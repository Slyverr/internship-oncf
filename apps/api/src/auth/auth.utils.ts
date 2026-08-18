import { Permission } from "@ecommand/shared";
import { AuthUser } from "./auth.types";

const MANAGE_PERMISSION_PARENT_MAP: Readonly<
	Partial<Record<Permission, Permission>>
> = Object.values(Permission).reduce(
	(map, permission) => {
		const parts = permission.split(":");

		if (parts.length === 3 && parts[1] === "manage") {
			const parent = `${parts[0]}:manage` as Permission;
			if (Object.values(Permission).includes(parent)) {
				map[permission] = parent;
			}
		}

		return map;
	},
	{} as Partial<Record<Permission, Permission>>,
);

export function hasOnePermission(
	user: AuthUser,
	permission: Permission,
): boolean {
	const parent = MANAGE_PERMISSION_PARENT_MAP[permission];
	return user.permissions.some((p) => p === permission || p === parent);
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
