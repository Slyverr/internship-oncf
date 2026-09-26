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
			grants(
				Role.CLIENT_REPRESENTATIVE,
				Permission.CLAIMS_ACTION_START_PROGRESS,
			),
		).toBe(false);
		expect(grants(Role.CLIENT_REPRESENTATIVE, Permission.USERS_READ)).toBe(
			false,
		);
	});

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
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CUSTOMERS_READ)).toBe(true);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.CUSTOMERS_CREATE)).toBe(
			false,
		);
		expect(grants(Role.AGENT_COMMERCIAL, Permission.USERS_READ)).toBe(false);
	});
});
