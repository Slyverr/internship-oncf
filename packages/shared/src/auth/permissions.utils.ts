import { Permission } from "../enums/auth.enum";
import { PERMISSION_DEFINITIONS } from "./permissions";

export const PERMISSION_PARENTS: Partial<Record<Permission, Permission>> =
	Object.fromEntries(
		Object.entries(PERMISSION_DEFINITIONS)
			.filter(([, definition]) => definition.parent)
			.map(([permission, definition]) => [permission, definition.parent]),
	);

export function hasOnePermission(
	permissions: ReadonlySet<Permission>,
	permission: Permission,
): boolean {
	let current: Permission | undefined = permission;

	while (current) {
		if (permissions.has(current)) {
			return true;
		}

		current = PERMISSION_PARENTS[current];
	}

	return false;
}

export function hasAllPermissions(
	permissions: ReadonlySet<Permission>,
	...permissionsToCheck: Permission[]
): boolean {
	return permissionsToCheck.every((permission) =>
		hasOnePermission(permissions, permission),
	);
}

export function hasAnyPermission(
	permissions: ReadonlySet<Permission>,
	...permissionsToCheck: Permission[]
): boolean {
	return permissionsToCheck.some((permission) =>
		hasOnePermission(permissions, permission),
	);
}
