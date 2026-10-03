import {
	DEFAULT_ROLE_PERMISSIONS,
	hasOnePermission,
	Permission,
	Role,
	RolePersona,
} from "@ecommand/shared";
import { PERMISSIONS, ROLE_PERMISSIONS_MAP, ROLES } from "./auth.const";

describe("system role reference data", () => {
	it.each([
		[Role.ADMIN, RolePersona.ADMIN],
		[Role.AGENT_COMMERCIAL, RolePersona.AGENT_COMMERCIAL],
		[Role.CLIENT_REPRESENTATIVE, RolePersona.CLIENT_REPRESENTATIVE],
	])(
		"marks %s as a system role with its operational persona",
		(role, persona) => {
			expect(ROLES[role]).toMatchObject({
				name: role,
				isSystem: true,
				persona,
			});
		},
	);

	it("seeds claim closure only for the agent system role", () => {
		const closePermissionId = PERMISSIONS[Permission.CLAIMS_ACTION_CLOSE].id;
		const clientPermissionIds = ROLE_PERMISSIONS_MAP[
			Role.CLIENT_REPRESENTATIVE
		].map(({ permissionId }) => permissionId);
		const agentPermissionIds = ROLE_PERMISSIONS_MAP[Role.AGENT_COMMERCIAL].map(
			({ permissionId }) => permissionId,
		);

		expect(DEFAULT_ROLE_PERMISSIONS[Role.CLIENT_REPRESENTATIVE]).not.toContain(
			Permission.CLAIMS_ACTION_CLOSE,
		);
		expect(
			hasOnePermission(
				new Set(DEFAULT_ROLE_PERMISSIONS[Role.AGENT_COMMERCIAL]),
				Permission.CLAIMS_ACTION_CLOSE,
			),
		).toBe(true);
		expect(clientPermissionIds).not.toContain(closePermissionId);
		expect(agentPermissionIds).toContain(
			PERMISSIONS[Permission.CLAIMS_ACTION].id,
		);
	});
});
