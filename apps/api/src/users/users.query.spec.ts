import type { DrizzleService } from "@/database/drizzle.service";
import { UsersQuery } from "./users.query";

describe("UsersQuery login identifier lookup", () => {
	it.each([
		["person@example.test", { email: { ilike: "person@example.test" } }],
		["EMP-12", { employeeCode: { ilike: "EMP-12" } }],
	])(
		"looks up %s in the appropriate identifier namespace",
		async (identifier, where) => {
			const findFirst = jest.fn().mockResolvedValue(undefined);
			const drizzle = {
				db: {
					query: {
						users: { findFirst },
					},
				},
			} as unknown as DrizzleService;
			const query = new UsersQuery(drizzle);

			await expect(
				query.findUserByLoginIdentifier(identifier),
			).resolves.toBeUndefined();
			expect(findFirst).toHaveBeenCalledWith({ where });
		},
	);
});
