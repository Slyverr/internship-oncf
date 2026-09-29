import { Role } from "@ecommand/shared";
import { ClaimsQuery } from "./claims.query";

describe("ClaimsQuery comment notification recipients", () => {
	it("returns active commercial agent user IDs", async () => {
		const findMany = jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]);
		const query = new ClaimsQuery({
			db: { query: { users: { findMany } } },
		} as never);

		await expect(query.findCommercialAgentIds(42)).resolves.toEqual([7, 8]);
		expect(findMany).toHaveBeenCalledWith({
			where: {
				isActive: true,
				role: { name: Role.AGENT_COMMERCIAL },
				userCustomers: { customerId: 42 },
			},
			columns: { id: true },
		});
	});
});

describe("ClaimsQuery customer portfolio filters", () => {
	const findMany = jest.fn().mockResolvedValue([]);
	const query = new ClaimsQuery({
		db: { query: { claims: { findMany } } },
	} as never);

	beforeEach(() => findMany.mockClear());

	it("intersects a requested customer with the assigned portfolio", async () => {
		await query.findClaims({ customerId: 43 } as never, [42, 43]);

		expect(findMany.mock.calls[0][0].where.customerId).toEqual({ in: [43] });
	});

	it("returns no claims when the requested customer is outside the portfolio", async () => {
		await query.findClaims({ customerId: 99 } as never, [42, 43]);

		expect(findMany.mock.calls[0][0].where.customerId).toEqual({ in: [] });
	});
});
