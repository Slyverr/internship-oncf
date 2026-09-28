import {
	DEFAULT_ROLE_PERMISSIONS,
	hasOnePermission,
	Permission,
	Role,
} from "@ecommand/shared";

describe("default role permission matrix", () => {
	function grants(role: Role, permission: Permission): boolean {
		const assigned = DEFAULT_ROLE_PERMISSIONS[role];
		if (assigned === "ALL") return true;
		return hasOnePermission(new Set(assigned), permission);
	}

	it("grants administrators every permission", () => {
		for (const permission of Object.values(Permission)) {
			expect(grants(Role.ADMIN, permission)).toBe(true);
		}
	});

	it("limits client representatives to order submission and client-facing work", () => {
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_CREATE)).toBe(
			true,
		);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_ACTION_SUBMIT),
		).toBe(true);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_ACTION_APPROVE),
		).toBe(false);
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.CLAIMS_CREATE)).toBe(
			true,
		);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.CLAIMS_ACTION_COMMENT),
		).toBe(true);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.CLAIMS_ACTION_CLOSE),
		).toBe(true);
		expect(
			grants(
				Role.CLIENT_REPRESENTATIVE,
				Permission.CLAIMS_ACTION_START_PROGRESS,
			),
		).toBe(false);
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.USERS_READ)).toBe(
			false,
		);
	});

	it.each([Role.CLIENT_REPRESENTATIVE, Role.AGENT_COMMERCIAL])(
		"grants %s catalog reads without catalog administration",
		(role) => {
			const managementPermissions = [
				Permission.CATALOG_MANAGE_UNITS,
				Permission.CATALOG_MANAGE_GOODS_TYPES,
				Permission.CATALOG_MANAGE_GOODS,
				Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS,
				Permission.CATALOG_MANAGE_REJECTION_REASONS,
			];
			expect(grants(role, Permission.CATALOG_READ)).toBe(true);
			for (const permission of managementPermissions) {
				expect(grants(role, permission)).toBe(false);
			}
		},
	);

	it("grants commercial agents operational lifecycle actions without user administration", () => {
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.ORDERS_ACTION_APPROVE),
		).toBe(true);
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.PROGRAMS_ACTION_CONFIRM),
		).toBe(true);
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_ACTION_START_TREATMENT),
		).toBe(true);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_CREATE)).toBe(true);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_READ)).toBe(true);
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_ACTION_COMMENT),
		).toBe(true);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_MANAGE_OTHER)).toBe(
			true,
		);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CUSTOMERS_READ)).toBe(true);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CUSTOMERS_CREATE)).toBe(
			false,
		);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.USERS_READ)).toBe(false);
	});
	it("grants commercial agents cross-user access to the claims work queue", () => {
		expect(grants(Role.AGENT_COMMERCIAL, Permission.ORDERS_MANAGE_OTHER)).toBe(
			true,
		);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CLAIMS_MANAGE_OTHER)).toBe(
			true,
		);
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.PROGRAMS_MANAGE_OTHER),
		).toBe(false);
		expect(
			grants(Role.AGENT_COMMERCIAL, Permission.PROGRAMS_MANAGE_OWNERSHIP),
		).toBe(true);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_MANAGE_OTHER),
		).toBe(false);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.CLAIMS_MANAGE_OTHER),
		).toBe(false);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.PROGRAMS_MANAGE_OTHER),
		).toBe(false);
	});

	it("allows client representatives to delete only through their own-order scope", () => {
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_DELETE)).toBe(
			true,
		);
		expect(
			grants(Role.CLIENT_REPRESENTATIVE, Permission.ORDERS_MANAGE_OTHER),
		).toBe(false);
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.PROGRAMS_CREATE)).toBe(
			false,
		);
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.CLAIMS_UPDATE)).toBe(
			false,
		);
	});
});
