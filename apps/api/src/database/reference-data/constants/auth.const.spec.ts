import { Role, RolePersona } from "@ecommand/shared";
import { ROLES } from "./auth.const";

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
});
