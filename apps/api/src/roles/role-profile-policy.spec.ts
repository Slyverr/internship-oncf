import { Permission, RolePersona } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import {
	assertCustomRolePermissions,
	isCustomRolePermissionAssignable,
	isCustomRolePersona,
	isReservedCustomRolePermission,
} from "./role-profile-policy";

describe("custom role profile policy", () => {
	it("allows only operational personas for custom profiles", () => {
		expect(isCustomRolePersona(RolePersona.AGENT_COMMERCIAL)).toBe(true);
		expect(isCustomRolePersona(RolePersona.CLIENT_REPRESENTATIVE)).toBe(true);
		expect(isCustomRolePersona(RolePersona.ADMIN)).toBe(false);
	});

	it.each([
		Permission.USERS_READ,
		Permission.USERS_MANAGE_OTHER,
		Permission.ROLES_MANAGE,
		Permission.PERMISSIONS_MANAGE,
	])("reserves %s for system role grants", (permission) => {
		expect(isReservedCustomRolePermission(permission)).toBe(true);
		expect(() => assertCustomRolePermissions([permission])).toThrow(
			ForbiddenException,
		);
	});

	it.each([
		Permission.PROGRAMS_ACTION_EXECUTE,
		Permission.TRACKING_MANAGE,
		Permission.LOGS_READ,
		Permission.ARCHIVAL_READ,
		Permission.ARCHIVAL_MANAGE,
	])(
		"does not allow unsupported permission %s for custom profiles",
		(permission) => {
			expect(isCustomRolePermissionAssignable(permission)).toBe(false);
			expect(() => assertCustomRolePermissions([permission])).toThrow(
				ForbiddenException,
			);
		},
	);

	it("allows operational grants for custom profiles", () => {
		expect(() =>
			assertCustomRolePermissions([
				Permission.ORDERS_READ,
				Permission.CLAIMS_ACTION_COMMENT,
			]),
		).not.toThrow();
	});
});
