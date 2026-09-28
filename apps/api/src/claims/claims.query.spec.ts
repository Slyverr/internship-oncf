import { Role } from "@ecommand/shared";
import { ClaimsQuery } from "./claims.query";

describe("ClaimsQuery comment notification recipients", () => {
	it("returns active commercial agent user IDs", async () => {
		const findMany = jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]);
		const query = new ClaimsQuery({
			db: { query: { users: { findMany } } },
		} as never);

		await expect(query.findCommercialAgentIds()).resolves.toEqual([7, 8]);
		expect(findMany).toHaveBeenCalledWith({
			where: {
				isActive: true,
				role: { name: Role.AGENT_COMMERCIAL },
			},
			columns: { id: true },
		});
	});
});
