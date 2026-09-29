import { Permission, Role } from "@ecommand/shared";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import { ClaimsService } from "./claims.service";
import type { ListClaimQueryDto } from "./requests/list-claim.dto";

describe("ClaimsService access scoping", () => {
	const findClaims = jest.fn();
	const service = new ClaimsService(
		{ notifyChange: jest.fn() } as never,
		{ findClaims } as unknown as ClaimsQuery,
		{} as ClaimsMapper,
	);
	const client = {
		id: 12,
		email: "client@example.test",
		role: Role.CLIENT_REPRESENTATIVE,
		permissions: new Set([Permission.CLAIMS_READ]),
		sessionId: "session",
		customerId: 42,
		agencyId: null,
	};

	beforeEach(() => findClaims.mockReset().mockResolvedValue([]));

	it("forces customer users to their own user and customer scope", async () => {
		const query = { userId: 99, customerId: 43 } as ListClaimQueryDto;
		await service.findAll(client, query);
		expect(findClaims).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 12, customerId: 42 }),
		);
	});

	it("uses an empty customer scope for an unassigned commercial agent", async () => {
		const agent = {
			...client,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [],
		};
		const query = { customerId: 43 } as ListClaimQueryDto;
		await service.findAll(agent, query);
		expect(findClaims).toHaveBeenCalledWith(query, []);
	});

	it("scopes a commercial agent to assigned customers", async () => {
		const agent = {
			...client,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42, 43],
		};
		const query = { customerId: 43 } as ListClaimQueryDto;
		await service.findAll(agent, query);
		expect(findClaims).toHaveBeenCalledWith(query, [42, 43]);
	});

	it("keeps commercial claims managers inside their customer portfolio", async () => {
		const agent = {
			...client,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42, 44],
			permissions: new Set([
				Permission.CLAIMS_READ,
				Permission.CLAIMS_MANAGE_OTHER,
			]),
		};
		const query = { customerId: 43 } as ListClaimQueryDto;
		await service.findAll(agent, query);
		expect(findClaims).toHaveBeenCalledWith(query, [42, 44]);
	});

	it("preserves broad claims scope for users with manage-other permission", async () => {
		const admin = {
			...client,
			role: Role.ADMIN,
			permissions: new Set([Permission.CLAIMS_MANAGE_OTHER]),
		};
		const query = { customerId: 43 } as ListClaimQueryDto;
		await service.findAll(admin, query);
		expect(findClaims).toHaveBeenCalledWith(query);
	});
});
