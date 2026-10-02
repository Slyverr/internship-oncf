import { Permission } from "@ecommand/shared";
import {
	claimComments,
	claimStatusHistory,
	claims,
	notifications,
} from "drizzle/schema";
import { ClaimsQuery } from "./claims.query";

describe("ClaimsQuery comment transaction", () => {
	it("inserts the comment and notifications in the same transaction", async () => {
		const comment = { id: 88 };
		const commentReturning = jest.fn().mockResolvedValue([comment]);
		const commentValues = jest
			.fn()
			.mockReturnValue({ returning: commentReturning });
		const notificationValues = jest.fn().mockResolvedValue(undefined);
		const transactionContext = {
			insert: jest.fn((table: unknown) =>
				table === claimComments
					? { values: commentValues }
					: { values: notificationValues },
			),
		};
		const transaction = jest
			.fn()
			.mockImplementation(
				(callback: (tx: typeof transactionContext) => unknown) =>
					callback(transactionContext),
			);
		const query = new ClaimsQuery({ db: { transaction } } as never);

		await expect(
			query.addClaimComment(23 as never, "Reply", 7, {
				notifications: [{ recipientUserId: 12 } as never],
			}),
		).resolves.toEqual(comment);

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(transactionContext.insert).toHaveBeenNthCalledWith(1, claimComments);
		expect(transactionContext.insert).toHaveBeenNthCalledWith(2, notifications);
		expect(notificationValues).toHaveBeenCalledWith([{ recipientUserId: 12 }]);
	});
});

describe("ClaimsQuery comment notification recipients", () => {
	it("returns active users with claim-read permission assigned to the customer", async () => {
		const findMany = jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]);
		const query = new ClaimsQuery({
			db: { query: { users: { findMany } } },
		} as never);

		await expect(query.findClaimReadersForCustomer(42)).resolves.toEqual([
			7, 8,
		]);
		expect(findMany).toHaveBeenCalledWith({
			where: {
				isActive: true,
				role: {
					rolePermissions: {
						permission: { name: Permission.CLAIMS_READ },
					},
				},
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

	it("searches claims by their stored public number", async () => {
		await query.findClaims({ search: "CLM-ABCDEFGHJK" } as never);

		expect(findMany.mock.calls[0][0].where.OR).toContainEqual({
			claimNumber: { ilike: "%CLM-ABCDEFGHJK%" },
		});
	});

	it("combines list filters, sorting, and pagination", async () => {
		await query.findClaims({
			page: 3,
			limit: 10,
			search: "damaged",
			customerId: 42,
			userId: 7,
			orderId: 18,
			operationId: 23,
			type: "QUALITY",
			status: "IN_PROGRESS",
			priority: "HIGH",
			sortBy: "updatedAt",
			sortOrder: "asc",
		} as never);

		expect(findMany.mock.calls[0][0]).toMatchObject({
			where: {
				customerId: 42,
				createdByUserId: 7,
				orderId: 18,
				operationId: 23,
				claimType: { name: "QUALITY" },
				claimStatus: { name: "IN_PROGRESS" },
				priority: "HIGH",
				OR: expect.arrayContaining([
					{ claimNumber: { ilike: "%damaged%" } },
					{ description: { ilike: "%damaged%" } },
					{ resolution: { ilike: "%damaged%" } },
				]),
			},
			orderBy: { updatedAt: "asc" },
			limit: 10,
			offset: 20,
		});
	});

	it("allows broad lists when no customer portfolio is supplied", async () => {
		await query.findClaims({} as never);

		expect(findMany.mock.calls[0][0]).toMatchObject({
			where: {},
			orderBy: { createdAt: "desc" },
			limit: 20,
			offset: 0,
		});
	});

	it("uses the assigned portfolio when no customer filter is requested", async () => {
		await query.findClaims({} as never, [42, 43]);

		expect(findMany.mock.calls[0][0].where.customerId).toEqual({
			in: [42, 43],
		});
	});
});

describe("ClaimsQuery lookups", () => {
	const queryFindFirst = jest.fn();
	const query = new ClaimsQuery({
		db: {
			query: {
				orders: { findFirst: queryFindFirst },
				claims: { findFirst: queryFindFirst },
			},
		},
	} as never);

	beforeEach(() => queryFindFirst.mockReset().mockResolvedValue({ id: 11 }));

	it("finds an order customer using only the customer id", async () => {
		await query.findOrderCustomer(25);

		expect(queryFindFirst).toHaveBeenCalledWith({
			where: { id: 25 },
			columns: { customerId: true },
		});
	});

	it("loads a claim association using only its customer and order ids", async () => {
		await query.findClaimAssociation(11 as never);

		expect(queryFindFirst).toHaveBeenCalledWith({
			where: { id: 11 },
			columns: { customerId: true, orderId: true },
		});
	});

	it("loads full claim detail by internal id and public number", async () => {
		await query.findClaim(11 as never);
		expect(queryFindFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({
				where: { id: 11 },
				with: expect.objectContaining({
					claimComments: true,
					claimStatusHistories: true,
					closedByUser: {
						columns: { id: true, firstName: true, lastName: true },
					},
				}),
			}),
		);

		await query.findClaimByNumber("CLM-ABCDEFGHJK" as never);
		expect(queryFindFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({ where: { claimNumber: "CLM-ABCDEFGHJK" } }),
		);
	});

	it.each([
		[
			"findClaimIdByNumber",
			{ where: { claimNumber: "CLM-ABCDEFGHJK" }, columns: { id: true } },
		],
		[
			"findClaimForOwnership",
			{
				where: { id: 11 },
				columns: { claimNumber: true, createdByUserId: true, customerId: true },
			},
		],
		[
			"findClaimForOwnershipByNumber",
			{
				where: { claimNumber: "CLM-ABCDEFGHJK" },
				columns: { claimNumber: true, createdByUserId: true, customerId: true },
			},
		],
		[
			"findClaimStatus",
			{
				where: { id: 11 },
				columns: { statusId: true, claimNumber: true, createdByUserId: true },
			},
		],
	] as const)("uses a narrow query for %s", async (method, expected) => {
		if (method === "findClaimIdByNumber") {
			await query.findClaimIdByNumber("CLM-ABCDEFGHJK" as never);
		} else if (method === "findClaimForOwnership") {
			await query.findClaimForOwnership(11 as never);
		} else if (method === "findClaimForOwnershipByNumber") {
			await query.findClaimForOwnershipByNumber("CLM-ABCDEFGHJK" as never);
		} else {
			await query.findClaimStatus(11 as never);
		}
		expect(queryFindFirst).toHaveBeenCalledWith(expected);
	});
});

describe("ClaimsQuery status transactions", () => {
	it("records status history and its notification with an updated claim", async () => {
		const historyValues = jest.fn().mockResolvedValue(undefined);
		const notificationValues = jest.fn().mockResolvedValue(undefined);
		const returning = jest.fn().mockResolvedValue([{ id: 11 }]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const transactionContext = {
			update: jest.fn().mockReturnValue({ set }),
			insert: jest.fn((table: unknown) => ({
				values:
					table === claimStatusHistory ? historyValues : notificationValues,
			})),
		};
		const transaction = jest
			.fn()
			.mockImplementation((callback) => callback(transactionContext));
		const query = new ClaimsQuery({ db: { transaction } } as never);

		await expect(
			query.updateClaim(11 as never, { statusId: "resolved" } as never, {
				history: { userId: 7, comment: "Resolved" },
				notification: { recipientUserId: 12 } as never,
			}),
		).resolves.toEqual({ id: 11 });

		expect(set).toHaveBeenCalledWith({ statusId: "resolved" });
		expect(historyValues).toHaveBeenCalledWith({
			claimId: 11,
			statusId: "resolved",
			changedByUserId: 7,
			comment: "Resolved",
		});
		expect(notificationValues).toHaveBeenCalledWith({ recipientUserId: 12 });
	});

	it("does not record status side effects if the conditional update misses", async () => {
		const historyValues = jest.fn();
		const notificationValues = jest.fn();
		const returning = jest.fn().mockResolvedValue([]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const transactionContext = {
			update: jest.fn().mockReturnValue({ set }),
			insert: jest.fn((table: unknown) => ({
				values:
					table === claimStatusHistory ? historyValues : notificationValues,
			})),
		};
		const transaction = jest
			.fn()
			.mockImplementation((callback) => callback(transactionContext));
		const query = new ClaimsQuery({ db: { transaction } } as never);

		await expect(
			query.updateClaim(11 as never, { statusId: "resolved" } as never, {
				history: { userId: 7 },
				notification: { recipientUserId: 12 } as never,
			}),
		).resolves.toBeUndefined();

		expect(historyValues).not.toHaveBeenCalled();
		expect(notificationValues).not.toHaveBeenCalled();
	});

	it("keeps a comment and notifications when a concurrent transition loses", async () => {
		const createdComment = { id: 88 };
		const commentReturning = jest.fn().mockResolvedValue([createdComment]);
		const commentValues = jest
			.fn()
			.mockReturnValue({ returning: commentReturning });
		const historyValues = jest.fn();
		const notificationValues = jest.fn().mockResolvedValue(undefined);
		const returning = jest.fn().mockResolvedValue([]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const transactionContext = {
			insert: jest.fn((table: unknown) => ({
				values:
					table === claimComments
						? commentValues
						: table === claimStatusHistory
							? historyValues
							: notificationValues,
			})),
			update: jest.fn().mockReturnValue({ set }),
		};
		const transaction = jest
			.fn()
			.mockImplementation((callback) => callback(transactionContext));
		const query = new ClaimsQuery({ db: { transaction } } as never);

		await expect(
			query.addClaimComment(23 as never, "I have more details", 7, {
				statusTransition: {
					fromStatusId: "open",
					toStatusId: "in-progress",
					changedByUserId: 7,
				},
				notifications: [{ recipientUserId: 12 } as never],
			}),
		).resolves.toEqual(createdComment);

		expect(commentValues).toHaveBeenCalledWith({
			claimId: 23,
			authorUserId: 7,
			comment: "I have more details",
		});
		expect(set).toHaveBeenCalledWith(
			expect.objectContaining({ statusId: "in-progress" }),
		);
		expect(historyValues).not.toHaveBeenCalled();
		expect(notificationValues).toHaveBeenCalledWith([{ recipientUserId: 12 }]);
	});

	it("records history when a comment-triggered status transition succeeds", async () => {
		const commentReturning = jest.fn().mockResolvedValue([{ id: 89 }]);
		const commentValues = jest
			.fn()
			.mockReturnValue({ returning: commentReturning });
		const historyValues = jest.fn().mockResolvedValue(undefined);
		const returning = jest.fn().mockResolvedValue([{ id: 23 }]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const transactionContext = {
			insert: jest.fn((table: unknown) => ({
				values: table === claimComments ? commentValues : historyValues,
			})),
			update: jest.fn().mockReturnValue({ set }),
		};
		const transaction = jest
			.fn()
			.mockImplementation((callback) => callback(transactionContext));
		const query = new ClaimsQuery({ db: { transaction } } as never);

		await query.addClaimComment(23 as never, "Resolved", 7, {
			statusTransition: {
				fromStatusId: "in-progress",
				toStatusId: "resolved",
				changedByUserId: 7,
			},
		});

		expect(historyValues).toHaveBeenCalledWith({
			claimId: 23,
			statusId: "resolved",
			changedByUserId: 7,
			comment: null,
		});
	});
});

describe("ClaimsQuery persistence helpers", () => {
	it("returns the generated id when creating a claim", async () => {
		const returning = jest.fn().mockResolvedValue([{ id: 31 }]);
		const values = jest.fn().mockReturnValue({ returning });
		const insert = jest.fn().mockReturnValue({ values });
		const query = new ClaimsQuery({ db: { insert } } as never);
		const newClaim = { description: "Damaged shipment" };

		await expect(query.createClaim(newClaim as never)).resolves.toEqual({
			id: 31,
		});
		expect(insert).toHaveBeenCalledWith(claims);
		expect(values).toHaveBeenCalledWith(newClaim);
		expect(returning).toHaveBeenCalledWith({ id: claims.id });
	});

	it("returns the deleted claim id", async () => {
		const returning = jest.fn().mockResolvedValue([{ id: 31 }]);
		const where = jest.fn().mockReturnValue({ returning });
		const deleteQuery = jest.fn().mockReturnValue({ where });
		const query = new ClaimsQuery({ db: { delete: deleteQuery } } as never);

		await expect(query.deleteClaim(31 as never)).resolves.toEqual({ id: 31 });
		expect(deleteQuery).toHaveBeenCalledWith(claims);
		expect(returning).toHaveBeenCalledWith({ id: claims.id });
	});

	it("filters a comment lookup by claim and optional comment id", async () => {
		const findMany = jest.fn().mockResolvedValue([{ id: 9 }]);
		const query = new ClaimsQuery({
			db: { query: { claimComments: { findMany } } },
		} as never);

		await query.findClaimComments(23 as never, 9);
		const withId = findMany.mock.calls[0][0];
		expect(withId.where).toEqual({ claimId: 23, id: 9 });
		expect(withId.columns).toEqual({
			id: true,
			claimId: true,
			authorUserId: true,
			comment: true,
			createdAt: true,
		});
		const ascending = jest.fn((column: string) => `${column} asc`);
		expect(
			withId.orderBy({ createdAt: "created_at" }, { asc: ascending } as never),
		).toEqual(["created_at asc"]);
		expect(ascending).toHaveBeenCalledWith("created_at");

		await query.findClaimComments(23 as never);
		expect(findMany.mock.calls[1][0].where).toEqual({ claimId: 23 });
	});
});
