import { Role } from "@ecommand/shared";
import type { AuthUser } from "./auth.types";
import { canAccessCustomer, getCustomerScope } from "./customer-scope";

const user = (values: Partial<AuthUser>): AuthUser =>
	({
		id: 1,
		email: "user@example.test",
		role: Role.CLIENT_REPRESENTATIVE,
		permissions: new Set(),
		sessionId: "session",
		customerId: null,
		agencyId: null,
		...values,
	}) as AuthUser;

describe("customer scope", () => {
	it("fails closed for a commercial agent without assignments", () => {
		const agent = user({ role: Role.AGENT_COMMERCIAL });
		expect(getCustomerScope(agent)).toEqual([]);
		expect(canAccessCustomer(agent, 42)).toBe(false);
	});

	it("uses the commercial-agent portfolio instead of legacy customerId", () => {
		const agent = user({
			role: Role.AGENT_COMMERCIAL,
			customerId: 99,
			assignedCustomerIds: [42, 43],
		});
		expect(getCustomerScope(agent)).toEqual([42, 43]);
		expect(canAccessCustomer(agent, 42)).toBe(true);
		expect(canAccessCustomer(agent, 99)).toBe(false);
	});

	it("uses the single customer assignment for client representatives", () => {
		expect(
			getCustomerScope(
				user({ role: Role.CLIENT_REPRESENTATIVE, customerId: 42 }),
			),
		).toEqual([42]);
	});

	it("keeps administrators unscoped", () => {
		expect(getCustomerScope(user({ role: Role.ADMIN }))).toBeNull();
	});
});
