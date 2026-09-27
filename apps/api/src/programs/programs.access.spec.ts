import type { AuthUser } from "@/auth/auth.types";
import { canAccessProgram } from "./programs.access";

const createUser = (id: number, customerId: number | null): AuthUser =>
	({ id, customerId }) as AuthUser;

describe("canAccessProgram", () => {
	const customerId = 42;
	const user = createUser(12, customerId);

	it("lets the request handler return not found for a missing program", () => {
		expect(canAccessProgram(undefined, user)).toBeUndefined();
	});

	it("allows the program creator", () => {
		expect(canAccessProgram({ createdByUserId: user.id }, user)).toBe(true);
	});

	it("allows a customer user to read programs linked to their customer orders", () => {
		expect(
			canAccessProgram({ createdByUserId: 77, order: { customerId } }, user),
		).toBe(true);
	});

	it("rejects programs linked to another customer", () => {
		expect(
			canAccessProgram(
				{ createdByUserId: 77, order: { customerId: 99 } },
				user,
			),
		).toBe(false);
	});

	it("does not grant an unassigned user customer-wide program access", () => {
		expect(
			canAccessProgram(
				{ createdByUserId: 77, order: { customerId: 42 } },
				createUser(18, null),
			),
		).toBe(false);
	});
});
