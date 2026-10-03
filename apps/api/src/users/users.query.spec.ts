import type { DrizzleService } from "@/database/drizzle.service";
import { UsersQuery } from "./users.query";

function setupAssignmentUpdate(updatedUsers: { id: number }[]) {
	const returning = jest.fn().mockResolvedValue(updatedUsers);
	const updateWhere = jest.fn().mockReturnValue({ returning });
	const set = jest.fn().mockReturnValue({ where: updateWhere });
	const update = jest.fn().mockReturnValue({ set });
	const deleteWhere = jest.fn().mockResolvedValue(undefined);
	const removeAssignments = jest.fn().mockReturnValue({ where: deleteWhere });
	const insertValues = jest.fn().mockResolvedValue(undefined);
	const insert = jest.fn().mockReturnValue({ values: insertValues });
	const tx = { update, delete: removeAssignments, insert };
	const transaction = jest.fn(async (callback: (tx: never) => unknown) =>
		callback(tx as never),
	);
	const query = new UsersQuery({ db: { transaction } } as never);

	return {
		query,
		transaction,
		set,
		updateWhere,
		returning,
		removeAssignments,
		deleteWhere,
		insert,
		insertValues,
	};
}

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

describe("UsersQuery customer-assignment updates", () => {
	it("preserves existing assignments when the update omits a new portfolio", async () => {
		const { query, transaction, removeAssignments, insert } =
			setupAssignmentUpdate([{ id: 12 }]);

		await expect(
			query.updateUserAndAssignments(12 as never, { firstName: "Updated" }),
		).resolves.toEqual({ id: 12 });

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(removeAssignments).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});

	it("does not alter assignments when the target user no longer exists", async () => {
		const { query, removeAssignments, insert } = setupAssignmentUpdate([]);

		await expect(
			query.updateUserAndAssignments(12 as never, {}, [4]),
		).resolves.toBeUndefined();

		expect(removeAssignments).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});

	it("clears the portfolio when given an explicit empty assignment list", async () => {
		const { query, removeAssignments, deleteWhere, insert } =
			setupAssignmentUpdate([{ id: 12 }]);

		await query.updateUserAndAssignments(12 as never, {}, []);

		expect(removeAssignments).toHaveBeenCalledTimes(1);
		expect(deleteWhere).toHaveBeenCalledTimes(1);
		expect(insert).not.toHaveBeenCalled();
	});

	it("replaces the portfolio with the supplied customer assignments", async () => {
		const { query, removeAssignments, deleteWhere, insert, insertValues } =
			setupAssignmentUpdate([{ id: 12 }]);

		await query.updateUserAndAssignments(12 as never, {}, [4, 8]);

		expect(removeAssignments).toHaveBeenCalledTimes(1);
		expect(deleteWhere).toHaveBeenCalledTimes(1);
		expect(insert).toHaveBeenCalledTimes(1);
		expect(insertValues).toHaveBeenCalledWith([
			{ userId: 12, customerId: 4 },
			{ userId: 12, customerId: 8 },
		]);
	});
});
