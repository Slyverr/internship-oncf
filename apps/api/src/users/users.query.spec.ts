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

describe("UsersQuery account lookups", () => {
	const findFirst = jest.fn();
	const query = new UsersQuery({
		db: { query: { users: { findFirst }, roles: { findFirst } } },
	} as never);

	beforeEach(() => findFirst.mockReset());

	it("checks email uniqueness without case sensitivity", async () => {
		findFirst.mockResolvedValue({ id: 4 });

		await expect(
			query.findUserEmailExists("User@Example.test" as never),
		).resolves.toBe(true);
		expect(findFirst).toHaveBeenCalledWith({
			where: { email: { ilike: "User@Example.test" } },
			columns: { id: true },
		});
	});

	it("reports email as available when there is no matching account", async () => {
		findFirst.mockResolvedValue(undefined);

		await expect(
			query.findUserEmailExists("new@example.test" as never),
		).resolves.toBe(false);
	});

	it("only returns active roles for user assignment", async () => {
		findFirst.mockResolvedValue(undefined);

		await query.findAssignableRole("custom-role-id");

		expect(findFirst).toHaveBeenCalledWith({
			where: { id: "custom-role-id", isActive: true },
			columns: { id: true, name: true, persona: true, isSystem: true },
		});
	});

	it("checks user existence by its opaque database id", async () => {
		findFirst.mockResolvedValue({ id: 9 });

		await expect(query.findUserExists(9 as never)).resolves.toBe(true);
		expect(findFirst).toHaveBeenCalledWith({
			where: { id: 9 },
			columns: { id: true },
		});
	});
});
