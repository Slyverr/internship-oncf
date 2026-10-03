import { RegistrationStatus } from "@ecommand/shared";
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

function setupUserDeactivation(
	activeAdministrators: { id: number }[],
	updatedUsers: { id: number }[],
) {
	const lockAdministrators = jest.fn().mockResolvedValue(activeAdministrators);
	const whereAdministrators = jest
		.fn()
		.mockReturnValue({ for: lockAdministrators });
	const joinAdministrators = jest.fn().mockReturnValue({
		where: whereAdministrators,
	});
	const fromAdministrators = jest
		.fn()
		.mockReturnValue({ innerJoin: joinAdministrators });
	const select = jest.fn().mockReturnValue({ from: fromAdministrators });
	const updateReturning = jest.fn().mockResolvedValue(updatedUsers);
	const updateWhere = jest.fn().mockReturnValue({ returning: updateReturning });
	const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
	const update = jest.fn().mockReturnValue({ set: updateSet });
	const tx = { select, update };
	const transaction = jest.fn(async (callback: (tx: never) => unknown) =>
		callback(tx as never),
	);
	const query = new UsersQuery({ db: { transaction } } as never);

	return {
		query,
		transaction,
		select,
		fromAdministrators,
		joinAdministrators,
		whereAdministrators,
		lockAdministrators,
		update,
		updateSet,
		updateWhere,
		updateReturning,
	};
}

function setupRegistrationReview(updatedUsers: { id: number }[]) {
	const returning = jest.fn().mockResolvedValue(updatedUsers);
	const where = jest.fn().mockReturnValue({ returning });
	const set = jest.fn().mockReturnValue({ where });
	const update = jest.fn().mockReturnValue({ set });
	const query = new UsersQuery({ db: { update } } as never);

	return { query, update, set, where, returning };
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

describe("UsersQuery administrator deactivation guard", () => {
	it("keeps the sole active administrator from being deactivated", async () => {
		const { query, lockAdministrators, update } = setupUserDeactivation(
			[{ id: 12 }],
			[],
		);

		await expect(query.deactivateUser(12 as never)).resolves.toBe(
			"LAST_ACTIVE_ADMIN",
		);

		expect(lockAdministrators).toHaveBeenCalledWith("update");
		expect(update).not.toHaveBeenCalled();
	});

	it.each([
		{
			name: "another active administrator exists",
			activeAdministrators: [{ id: 12 }, { id: 14 }],
		},
		{
			name: "the only active administrator is a different account",
			activeAdministrators: [{ id: 14 }],
		},
		{ name: "no active administrator remains", activeAdministrators: [] },
	])("deactivates the target when $name", async ({ activeAdministrators }) => {
		const { query, updateSet, updateWhere, updateReturning } =
			setupUserDeactivation(activeAdministrators, [{ id: 12 }]);

		await expect(query.deactivateUser(12 as never)).resolves.toEqual({
			id: 12,
		});

		expect(updateSet).toHaveBeenCalledWith({ isActive: false });
		expect(updateWhere).toHaveBeenCalled();
		expect(updateReturning).toHaveBeenCalled();
	});

	it("returns no user when the target account does not exist", async () => {
		const { query, update } = setupUserDeactivation([], []);

		await expect(query.deactivateUser(99 as never)).resolves.toBeUndefined();

		expect(update).toHaveBeenCalledTimes(1);
	});
});

describe("UsersQuery registration review", () => {
	it.each([
		{ status: RegistrationStatus.APPROVED, isActive: true },
		{ status: RegistrationStatus.REJECTED, isActive: false },
	] as const)(
		"sets $status registrations to active=$isActive",
		async ({ status, isActive }) => {
			const { query, update, set, where, returning } = setupRegistrationReview([
				{ id: 12 },
			]);

			await expect(
				query.reviewRegistration(12 as never, "client-role", status),
			).resolves.toEqual({
				id: 12,
			});

			expect(update).toHaveBeenCalled();
			expect(set).toHaveBeenCalledWith(
				expect.objectContaining({
					registrationStatus: status,
					isActive,
					updatedAt: expect.any(String),
				}),
			);
			expect(where).toHaveBeenCalled();
			expect(returning).toHaveBeenCalledWith({ id: expect.anything() });
		},
	);

	it("returns no account when there is no matching pending registration", async () => {
		const { query } = setupRegistrationReview([]);

		await expect(
			query.reviewRegistration(
				12 as never,
				"client-role",
				RegistrationStatus.APPROVED,
			),
		).resolves.toBeUndefined();
	});
});
