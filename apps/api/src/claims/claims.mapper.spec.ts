import { ClaimType, Permission, Role } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { ClaimsMapper } from "./claims.mapper";
import type { CreateClaimDto } from "./requests/create-claim.dto";

describe("ClaimsMapper customer scope", () => {
	const mapper = new ClaimsMapper();
	const customerUser = {
		id: 12,
		email: "client@example.test",
		role: Role.CLIENT_REPRESENTATIVE,
		permissions: new Set([Permission.CLAIMS_CREATE]),
		sessionId: "session",
		customerId: 42,
		agencyId: null,
	};
	const dto = (customerId: number) =>
		({
			customerId,
			type: ClaimType.OTHER,
			description: "Test claim description",
		}) as CreateClaimDto;

	it("allows a customer user to create a claim for their own customer", () => {
		expect(mapper.toCreate(dto(42), customerUser).customerId).toBe(42);
	});

	it("rejects a customer user trying to create a claim for another customer", () => {
		expect(() => mapper.toCreate(dto(43), customerUser)).toThrow(
			ForbiddenException,
		);
	});

	it("allows an internal user without a customer assignment to create for a customer", () => {
		const agent = {
			...customerUser,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
		};
		expect(mapper.toCreate(dto(43), agent).customerId).toBe(43);
	});

	it("allows cross-customer creation only with explicit manage-other permission", () => {
		const manager = {
			...customerUser,
			permissions: new Set([
				Permission.CLAIMS_CREATE,
				Permission.CLAIMS_MANAGE_OTHER,
			]),
		};
		expect(mapper.toCreate(dto(43), manager).customerId).toBe(43);
	});
});
