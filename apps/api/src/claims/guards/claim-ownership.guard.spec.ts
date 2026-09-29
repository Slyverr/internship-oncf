import { Permission, Role } from "@ecommand/shared";
import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { ClaimOwnershipGuard } from "./claim-ownership.guard";

const claim = (createdByUserId: number, customerId: number) => ({
	createdByUserId,
	customerId,
});

const createUser = (overrides: Partial<AuthUser>): AuthUser => ({
	id: 12,
	email: "user@example.test",
	role: Role.CLIENT_REPRESENTATIVE,
	permissions: new Set([Permission.CLAIMS_READ]),
	sessionId: "session",
	customerId: 42,
	agencyId: null,
	...overrides,
});

function createGuard(user: AuthUser, ownership: ReturnType<typeof claim>) {
	const service = {
		findOneForOwnership: jest.fn().mockResolvedValue(ownership),
	};
	const moduleRef = { get: jest.fn().mockReturnValue(service) };
	const guard = new ClaimOwnershipGuard(moduleRef as never);
	const context = {
		switchToHttp: () => ({
			getRequest: () => ({ params: { id: "31" }, user }),
		}),
	} as ExecutionContext;
	return { guard, service, context };
}

describe("ClaimOwnershipGuard customer scope", () => {
	it("allows a commercial agent to access another user's claim for an assigned customer", async () => {
		const user = createUser({
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42],
			permissions: new Set([Permission.CLAIMS_MANAGE_OTHER]),
		});
		const { guard, context } = createGuard(user, claim(77, 42));

		await expect(guard.canActivate(context)).resolves.toBe(true);
	});

	it("does not let manage-other bypass a commercial agent's portfolio", async () => {
		const user = createUser({
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42],
			permissions: new Set([Permission.CLAIMS_MANAGE_OTHER]),
		});
		const { guard, service, context } = createGuard(user, claim(12, 99));

		await expect(guard.canActivate(context)).rejects.toThrow(
			new ForbiddenException(
				"You can only access your own or assigned-customer claims",
			),
		);
		expect(service.findOneForOwnership).toHaveBeenCalled();
	});

	it("keeps client representatives scoped to claims they created", async () => {
		const user = createUser({ customerId: 42 });
		const { guard, context } = createGuard(user, claim(77, 42));

		await expect(guard.canActivate(context)).rejects.toThrow(
			ForbiddenException,
		);
	});

	it("allows a user with broad manage-other permission outside the agent role", async () => {
		const user = createUser({
			role: Role.ADMIN,
			customerId: null,
			permissions: new Set([Permission.CLAIMS_MANAGE_OTHER]),
		});
		const { guard, context } = createGuard(user, claim(77, 99));

		await expect(guard.canActivate(context)).resolves.toBe(true);
	});
});
