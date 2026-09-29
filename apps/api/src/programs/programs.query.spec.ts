import { Permission } from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { ProgramsQuery } from "./programs.query";

const createUser = (
	id: number,
	permissions: Permission[] = [],
	customerId: number | null = null,
) => ({ id, permissions: new Set(permissions), customerId }) as AuthUser;

describe("ProgramsQuery authorization scope", () => {
	const findMany = jest.fn();
	const query = new ProgramsQuery({
		db: { query: { forecastPrograms: { findMany } } },
	} as never);
	beforeEach(() => {
		findMany.mockReset().mockResolvedValue([]);
	});

	it("forces ordinary users to their own programs despite a requested user filter", async () => {
		const user = createUser(18);
		await query.findPrograms(user, {
			page: 2,
			limit: 5,
			userId: 91,
			search: "FP-",
			status: "APPROVED",
		} as never);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					createdByUserId: user.id,
					programStatus: { name: "APPROVED" },
					programNumber: { ilike: "%FP-%" },
				},
				limit: 5,
				offset: 5,
			}),
		);
	});

	it("allows managers to filter by a selected creator", async () => {
		const user = createUser(18, [Permission.PROGRAMS_MANAGE_OTHER]);
		await query.findPrograms(user, { page: 1, limit: 10, userId: 91 } as never);
		expect(findMany.mock.calls[0][0].where).toEqual({ createdByUserId: 91 });
	});

	it("allows managers to list all creators when no creator filter is selected", async () => {
		const user = createUser(18, [Permission.PROGRAMS_MANAGE_OTHER]);
		await query.findPrograms(user, { page: 1, limit: 10 } as never);
		expect(findMany.mock.calls[0][0].where).toEqual({});
	});

	it("scopes customer-assigned users to programs linked to their customer", async () => {
		const user = createUser(18, [], 42);
		await query.findPrograms(user, {
			page: 1,
			limit: 10,
			userId: 91,
		} as never);

		expect(findMany.mock.calls[0][0].where).toEqual({
			order: { customerId: 42 },
		});
	});
});

describe("ProgramsQuery history writes", () => {
	it("records the initial state when creating a program", async () => {
		const programValues = {
			orderId: 12,
			statusId: "draft-status",
			plannedDate: "2026-10-01T00:00:00.000Z",
			quantityPlanned: "100.000",
			createdByUserId: 9,
		} as never;
		const insertValues = jest
			.fn()
			.mockReturnValueOnce({
				returning: jest.fn().mockResolvedValue([{ id: 5 }]),
			})
			.mockResolvedValueOnce(undefined);
		const insert = jest.fn(() => ({ values: insertValues }));
		const tx = { insert };
		const transaction = jest.fn((callback) => callback(tx));
		const query = new ProgramsQuery({ db: { transaction } } as never);

		await expect(
			query.createProgram(programValues, {
				userId: 9,
				userName: "agent@example.test",
			}),
		).resolves.toEqual({ id: 5 });
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(insertValues).toHaveBeenNthCalledWith(2, {
			programId: 5,
			eventType: "CREATED",
			newQuantity: "100.000",
			newStatusId: "draft-status",
			newPlannedDate: "2026-10-01T00:00:00.000Z",
			changedByName: "agent@example.test",
			changedByUserId: 9,
		});
	});

	const makeQuery = (initialProgram: object | undefined) => {
		const findFirst = jest.fn().mockResolvedValue(initialProgram);
		const historyValues = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn(() => ({ values: historyValues }));
		const updateReturning = jest.fn().mockResolvedValue([{ id: 5 }]);
		const updateWhere = jest.fn(() => ({ returning: updateReturning }));
		const updateSet = jest.fn(() => ({ where: updateWhere }));
		const update = jest.fn(() => ({ set: updateSet }));
		const tx = {
			query: { forecastPrograms: { findFirst } },
			insert,
			update,
		};
		const transaction = jest.fn((callback) => callback(tx));
		const query = new ProgramsQuery({ db: { transaction } } as never);
		return {
			query,
			findFirst,
			historyValues,
			insert,
			transaction,
			update,
		};
	};

	it("records each changed program field in the same transaction as the update", async () => {
		const previous = {
			quantityPlanned: "100.000",
			quantityRealized: null,
			deviationReason: null,
			plannedDate: "2026-10-01T00:00:00.000Z",
			statusId: "draft-status",
		};
		const { query, historyValues, transaction, update } = makeQuery(previous);

		await query.updateProgram(
			5 as never,
			{
				statusId: "approved-status",
				quantityPlanned: "120.000",
				plannedDate: "2026-10-02T00:00:00.000Z",
				quantityRealized: "80.000",
				deviationReason: "Partial delivery",
			},
			undefined,
			{ userId: 9, userName: "agent@example.test" },
		);

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledTimes(1);
		expect(historyValues).toHaveBeenCalledTimes(4);
		expect(historyValues).toHaveBeenNthCalledWith(1, {
			programId: 5,
			changedByName: "agent@example.test",
			changedByUserId: 9,
			eventType: "STATUS_CHANGED",
			oldStatusId: "draft-status",
			newStatusId: "approved-status",
		});
		expect(historyValues).toHaveBeenNthCalledWith(2, {
			programId: 5,
			changedByName: "agent@example.test",
			changedByUserId: 9,
			eventType: "QUANTITY_MODIFIED",
			oldQuantity: "100.000",
			newQuantity: "120.000",
		});
		expect(historyValues).toHaveBeenNthCalledWith(3, {
			programId: 5,
			changedByName: "agent@example.test",
			changedByUserId: 9,
			eventType: "DATE_MODIFIED",
			oldPlannedDate: "2026-10-01T00:00:00.000Z",
			newPlannedDate: "2026-10-02T00:00:00.000Z",
		});
		expect(historyValues).toHaveBeenNthCalledWith(4, {
			programId: 5,
			changedByName: "agent@example.test",
			changedByUserId: 9,
			eventType: "EXECUTION_RECORDED",
			quantityRealized: "80.000",
			completionRate: "80.00",
			deviationReason: "Partial delivery",
		});
	});

	it("does not write history when a conditional update loses a race", async () => {
		const { query, historyValues, update } = makeQuery({
			quantityPlanned: "100.000",
			quantityRealized: null,
			deviationReason: null,
			plannedDate: "2026-10-01T00:00:00.000Z",
			statusId: "draft-status",
		});
		update.mockImplementationOnce(
			() =>
				({
					set: () => ({
						where: () => ({ returning: jest.fn().mockResolvedValue([]) }),
					}),
				}) as never,
		);

		await expect(
			query.updateProgram(
				5 as never,
				{ statusId: "approved-status" },
				undefined,
				{ userId: 9, userName: "agent@example.test" },
			),
		).resolves.toBeUndefined();
		expect(historyValues).not.toHaveBeenCalled();
	});
});
