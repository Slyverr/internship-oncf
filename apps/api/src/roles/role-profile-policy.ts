import {
	API_ERROR_CODES,
	PERMISSION_DEFINITIONS,
	Permission,
	RolePersona,
} from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";

export const CUSTOM_ROLE_PERSONAS = [
	RolePersona.AGENT_COMMERCIAL,
	RolePersona.CLIENT_REPRESENTATIVE,
] as const;

const RESERVED_CUSTOM_ROLE_PERMISSIONS = new Set<Permission>([
	Permission.ROLES_MANAGE,
	Permission.PERMISSIONS_MANAGE,
]);

export function isCustomRolePersona(
	persona: RolePersona,
): persona is (typeof CUSTOM_ROLE_PERSONAS)[number] {
	return CUSTOM_ROLE_PERSONAS.includes(
		persona as (typeof CUSTOM_ROLE_PERSONAS)[number],
	);
}

export function assertCustomRolePermissions(
	permissions: readonly Permission[],
) {
	const unassignable = permissions.filter(
		(permission) => !isCustomRolePermissionAssignable(permission),
	);

	if (unassignable.length > 0) {
		throw new ForbiddenException({
			code: API_ERROR_CODES.ACCESS_DENIED,
			details: { permissions: unassignable },
		});
	}
}

export function isReservedCustomRolePermission(permission: Permission) {
	return (
		permission.startsWith("users:") ||
		RESERVED_CUSTOM_ROLE_PERMISSIONS.has(permission)
	);
}

export function isCustomRolePermissionAssignable(permission: Permission) {
	const definition = PERMISSION_DEFINITIONS[permission];
	return (
		Boolean(definition) &&
		!isReservedCustomRolePermission(permission) &&
		definition.assignable !== false
	);
}
