import type { AuthUser } from "@/auth/auth.types";
import { canAccessOrder } from "./orders.access";

const createUser = (id: number, customerId: number | null) =>
	({ id, customerId }) as AuthUser;

describe("canAccessOrder", () => {
	const user = createUser(12, 42);

	it("lets the request handler return not found for a missing order", () => {
		expect(canAccessOrder(undefined, user)).toBeUndefined();
	});

	it("allows the order creator", () => {
		expect(
			canAccessOrder({ customerId: 99, createdByUserId: user.id }, user),
		).toBe(true);
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

	it("does not grant customer access when the user has no assignment", () => {
		expect(
			canAccessOrder(
				{ customerId: 42, createdByUserId: 77 },
				createUser(18, null),
			),
		).toBe(false);
	});
});
