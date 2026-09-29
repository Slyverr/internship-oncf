import type { AuthUser } from "@/auth/auth.types";
import { canAccessOrder } from "./orders.access";

const createUser = (id: number, customerId: number | null) =>
	({ id, customerId, permissions: new Set() }) as AuthUser;

describe("canAccessOrder", () => {
	const user = createUser(12, 42);

	it("lets the request handler return not found for a missing order", () => {
		expect(canAccessOrder(undefined, user)).toBeUndefined();
	});

	it("uses the assigned customer as the scope for assigned users", () => {
		expect(
			canAccessOrder({ customerId: 99, createdByUserId: user.id }, user),
		).toBe(false);
	});

	it("allows users assigned to the order's customer", () => {
		expect(canAccessOrder({ customerId: 42, createdByUserId: 77 }, user)).toBe(
			true,
		);
	});

	it("rejects users outside both the creator and customer scope", () => {
		expect(canAccessOrder({ customerId: 99, createdByUserId: 77 }, user)).toBe(
			false,
		);
	});

	it("allows creators when they have no customer assignment", () => {
		expect(
			canAccessOrder(
				{ customerId: 42, createdByUserId: 18 },
				createUser(18, null),
			),
		).toBe(true);
	});

	it("does not grant customer access to an unassigned non-creator", () => {
		expect(
			canAccessOrder(
				{ customerId: 42, createdByUserId: 77 },
				createUser(18, null),
			),
		).toBe(false);
	});
	it("allows a commercial agent to access orders for any assigned customer", () => {
		const agent = {
			...createUser(18, null),
			role: "AGENT_COMMERCIAL",
			assignedCustomerIds: [42, 43],
		} as AuthUser;
		expect(canAccessOrder({ customerId: 43, createdByUserId: 77 }, agent)).toBe(
			true,
		);
		expect(canAccessOrder({ customerId: 99, createdByUserId: 18 }, agent)).toBe(
			false,
		);
	});
});
