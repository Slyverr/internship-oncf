import { Permission, RolePersona } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import {
	assertCustomRolePermissions,
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

	it("allows operational grants for custom profiles", () => {
		expect(() =>
			assertCustomRolePermissions([
				Permission.ORDERS_READ,
				Permission.CLAIMS_ACTION_COMMENT,
			]),
		).not.toThrow();
	});
});
