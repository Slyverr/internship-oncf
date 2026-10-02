import { Permission } from "@ecommand/shared";
import { claimComments, notifications } from "drizzle/schema";
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
});
