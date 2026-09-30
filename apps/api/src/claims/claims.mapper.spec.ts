import { ClaimType, Permission, Role } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { ClaimsMapper } from "./claims.mapper";
import type { CreateClaimDto } from "./requests/create-claim.dto";
import type { UpdateClaimDto } from "./requests/update-claim.dto";

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
		const created = mapper.toCreate(dto(42), customerUser);
		expect(created.customerId).toBe(42);
		expect(created.claimNumber).toMatch(
			/^CLM-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/,
		);
	});

	it("rejects a customer user trying to create a claim for another customer", () => {
		expect(() => mapper.toCreate(dto(43), customerUser)).toThrow(
			ForbiddenException,
		);
	});

	it("rejects an unassigned commercial agent creating a claim", () => {
		const agent = {
			...customerUser,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [],
		};
		expect(() => mapper.toCreate(dto(43), agent)).toThrow(ForbiddenException);
	});

	it("allows a commercial agent to create for an assigned customer", () => {
		const agent = {
			...customerUser,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [43],
		};
		expect(mapper.toCreate(dto(43), agent).customerId).toBe(43);
	});

	it("does not let manage-other expand an agent beyond their portfolio", () => {
		const agent = {
			...customerUser,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42],
			permissions: new Set([
				Permission.CLAIMS_CREATE,
				Permission.CLAIMS_MANAGE_OTHER,
			]),
		};

		expect(() => mapper.toCreate(dto(43), agent)).toThrow(ForbiddenException);
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

	it("requires manage-other permission to change claim customer", () => {
		expect(() =>
			mapper.toUpdate({ customerId: 43 } as UpdateClaimDto, customerUser),
		).toThrow(ForbiddenException);
	});

	it("lets an agent change a claim only to an assigned customer", () => {
		const agent = {
			...customerUser,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42, 43],
			permissions: new Set([Permission.CLAIMS_MANAGE_OTHER]),
		};

		expect(
			mapper.toUpdate({ customerId: 43 } as UpdateClaimDto, agent).customerId,
		).toBe(43);
		expect(() =>
			mapper.toUpdate({ customerId: 99 } as UpdateClaimDto, agent),
		).toThrow(ForbiddenException);
	});
});
