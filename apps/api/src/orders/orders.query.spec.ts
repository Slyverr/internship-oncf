import { API_ERROR_CODES, Permission, Role } from "@ecommand/shared";
import { notifications, orderStatusHistory, orders } from "drizzle/schema";
import type { AuthUser } from "@/auth/auth.types";
import { OrdersQuery } from "./orders.query";

const createUser = (
	id: number,
	permissions: Permission[] = [],
	customerId: number | null = null,
) => ({ id, permissions: new Set(permissions), customerId }) as AuthUser;

describe("OrdersQuery authorization scope", () => {
	const findMany = jest.fn();
	const query = new OrdersQuery({
		db: { query: { orders: { findMany } } },
	} as never);
	beforeEach(() => {
		findMany.mockReset().mockResolvedValue([]);
	});

	it("applies supported list sorting and safely rejects arbitrary sort fields", async () => {
		const user = createUser(17, [Permission.ORDERS_MANAGE_OTHER]);

		await query.findOrders(user, {
			page: 1,
			limit: 20,
			sortBy: "orderDate",
			sortOrder: "asc",
		} as never);
		expect(findMany.mock.calls[0][0].orderBy).toEqual({
			orderDate: "asc",
			id: "desc",
		});

		await query.findOrders(user, {
			page: 1,
			limit: 20,
			sortBy: "customer",
			sortOrder: "asc",
		} as never);
		expect(findMany.mock.calls[1][0].orderBy).toEqual({
			createdAt: "asc",
			id: "desc",
		});
	});

	it("restricts ordinary order lists to the authenticated creator", async () => {
		const user = createUser(17);
		await query.findOrders(user, {
			page: 2,
			limit: 10,
			search: "steel",
			status: "APPROVED",
		} as never);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					createdByUserId: user.id,
					orderStatus: { name: "APPROVED" },
					OR: expect.arrayContaining([
						expect.objectContaining({ orderNumber: { ilike: "%steel%" } }),
					]),
				}),
				limit: 10,
				offset: 10,
			}),
		);
	});

	it("searches by customer code, goods, and ISO calendar date ranges", async () => {
		const user = createUser(17);
		await query.findOrders(user, {
			page: 1,
			limit: 20,
			search: "2026-10-04",
		} as never);

		const searchTerms = findMany.mock.calls[0][0].where.OR;
		expect(searchTerms).toEqual(
			expect.arrayContaining([
				{ customer: { customerCode: { ilike: "%2026-10-04%" } } },
				{ good: { name: { ilike: "%2026-10-04%" } } },
				{
					orderDate: {
						gte: "2026-10-04T00:00:00.000Z",
						lt: "2026-10-05T00:00:00.000Z",
					},
				},
				{
					createdAt: {
						gte: "2026-10-04T00:00:00.000Z",
						lt: "2026-10-05T00:00:00.000Z",
					},
				},
			]),
		);
	});

	it("can limit order searches to orders with assigned wagons", async () => {
		const user = createUser(17);
		await query.findOrders(user, {
			page: 1,
			limit: 20,
			hasAssignedWagons: true,
		} as never);

		expect(findMany.mock.calls[0][0].where).toMatchObject({
			createdByUserId: user.id,
			orderWagons: true,
		});
	});

	it("does not treat an invalid ISO date as a date search", async () => {
		const user = createUser(17);
		await query.findOrders(user, {
			page: 1,
			limit: 20,
			search: "2026-02-30",
		} as never);

		const searchTerms = findMany.mock.calls[0][0].where.OR;
		expect(searchTerms).not.toContainEqual(
			expect.objectContaining({ orderDate: expect.anything() }),
		);
	});

	it("applies every explicit filter to a manage-other order list", async () => {
		const user = createUser(17, [Permission.ORDERS_MANAGE_OTHER]);
		await query.findOrders(user, {
			page: 1,
			limit: 10,
			search: "ORD-ABC",
			status: "APPROVED",
			goodsId: 5,
			customerId: 42,
			movementTypeId: 6,
			startDate: "2026-01-01",
			endDate: "2026-12-31",
		} as never);

		expect(findMany.mock.calls[0][0].where).toMatchObject({
			customerId: 42,
			orderStatus: { name: "APPROVED" },
			goodsId: 5,
			movementTypeId: 6,
			startDate: { gte: "2026-01-01" },
			endDate: { lte: "2026-12-31" },
			OR: expect.arrayContaining([
				{ orderNumber: { ilike: "%ORD-ABC%" } },
				{ supervisor: { ilike: "%ORD-ABC%" } },
			]),
		});
	});

	it("allows cross-user lists only with the manage-other permission", async () => {
		const user = createUser(17, [Permission.ORDERS_MANAGE_OTHER]);
		await query.findOrders(user, { page: 1, limit: 20 } as never);
		const options = findMany.mock.calls[0][0];
		expect(options.where).not.toHaveProperty("createdByUserId");
		expect(options.limit).toBe(20);
	});

	it("intersects customer filters with the assigned customer scope", async () => {
		const user = createUser(23, [], 42);
		await query.findOrders(user, {
			page: 1,
			limit: 20,
			customerId: 99,
		} as never);

		expect(findMany.mock.calls[0][0].where).toEqual({
			customerId: { in: [] },
		});
	});

	it("scopes commercial-agent order lists to their full portfolio by default", async () => {
		const agent = {
			...createUser(24, [Permission.ORDERS_MANAGE_OTHER]),
			role: Role.AGENT_COMMERCIAL,
			assignedCustomerIds: [42, 43],
		};

		await query.findOrders(agent, { page: 1, limit: 20 } as never);

		expect(findMany.mock.calls[0][0].where).toEqual({
			customerId: { in: [42, 43] },
		});
	});

	it("intersects commercial-agent customer filters with their portfolio", async () => {
		const agent = {
			...createUser(24, [Permission.ORDERS_MANAGE_OTHER]),
			role: Role.AGENT_COMMERCIAL,
			assignedCustomerIds: [42, 43],
		};

		await query.findOrders(agent, {
			page: 1,
			limit: 20,
			customerId: 43,
		} as never);

		expect(findMany.mock.calls[0][0].where).toEqual({ customerId: 43 });
	});

	it("returns no commercial-agent orders for an unassigned customer filter", async () => {
		const agent = {
			...createUser(24, [Permission.ORDERS_MANAGE_OTHER]),
			role: Role.AGENT_COMMERCIAL,
			assignedCustomerIds: [42, 43],
		};

		await query.findOrders(agent, {
			page: 1,
			limit: 20,
			customerId: 99,
		} as never);

		expect(findMany.mock.calls[0][0].where).toEqual({
			customerId: { in: [] },
		});
	});

	it("restricts eligible orders to their creator for ordinary users", async () => {
		const user = createUser(18);
		await query.findEligibleOrdersForPrograms(user, {
			page: 3,
			limit: 5,
			search: "ON-4",
		});
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					forecastPrograms: false,
					createdByUserId: user.id,
					orderStatus: {
						name: { in: ["APPROVED", "SENT_TO_DTM", "IN_PROGRESS"] },
					},
					orderNumber: { ilike: "%ON-4%" },
				},
				limit: 5,
				offset: 10,
			}),
		);
	});

	it("omits creator filtering for eligible orders when manage-other is granted", async () => {
		const user = createUser(18, [Permission.ORDERS_MANAGE_OTHER]);
		await query.findEligibleOrdersForPrograms(user, { page: 1, limit: 20 });
		const options = findMany.mock.calls[0][0];
		expect(options.where).not.toHaveProperty("createdByUserId");
		expect(options.where.orderStatus).toEqual({
			name: { in: ["APPROVED", "SENT_TO_DTM", "IN_PROGRESS"] },
		});
		expect(options.where.forecastPrograms).toBe(false);
	});

	it("scopes eligible program orders to an assigned customer", async () => {
		const user = createUser(23, [], 42);
		await query.findEligibleOrdersForPrograms(user, { page: 1, limit: 20 });

		expect(findMany.mock.calls[0][0].where).toEqual({
			customerId: 42,
			forecastPrograms: false,
			orderStatus: {
				name: { in: ["APPROVED", "SENT_TO_DTM", "IN_PROGRESS"] },
			},
		});
	});

	it("filters eligible orders by an assigned portfolio and optional code search", async () => {
		const agent = {
			...createUser(24, [Permission.ORDERS_MANAGE_OTHER]),
			role: Role.AGENT_COMMERCIAL,
			assignedCustomerIds: [42, 43],
		};

		await query.findEligibleOrdersForPrograms(agent, {
			page: 2,
			limit: 8,
			search: "ORD-XYZ",
		});

		expect(findMany.mock.calls[0][0]).toMatchObject({
			where: {
				customerId: { in: [42, 43] },
				orderNumber: { ilike: "%ORD-XYZ%" },
			},
			limit: 8,
			offset: 8,
		});
	});
});

describe("OrdersQuery lookup methods", () => {
	const findFirst = jest.fn();
	const findLatestDtmRequest = jest.fn();
	const query = new OrdersQuery({
		db: {
			query: {
				orders: { findFirst },
				dtmIntegrationLog: { findFirst: findLatestDtmRequest },
			},
		},
	} as never);

	beforeEach(() => {
		findFirst.mockReset().mockResolvedValue({ id: 1 });
		findLatestDtmRequest.mockReset().mockResolvedValue(undefined);
	});

	it("loads order details with related workflow and active attachment data", async () => {
		await query.findOrder(12 as never);

		expect(findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 12 },
				with: expect.objectContaining({
					claims: true,
					forecastPrograms: true,
					orderStatusHistories: true,
					orderExecutions: true,
					orderFiles: expect.objectContaining({
						where: { deletedAt: { isNull: true } },
					}),
				}),
			}),
		);
		expect(findLatestDtmRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					relatedEntityType: "orders",
					relatedEntityId: 12,
				}),
				orderBy: { createdAt: "desc", id: "desc" },
			}),
		);
	});

	it("returns the latest simulator response fields with order details", async () => {
		findLatestDtmRequest.mockResolvedValue({
			status: "SUCCESS",
			responsePayload: JSON.stringify({ status: "ACCEPTED" }),
			createdAt: "2026-10-04T12:00:00.000Z",
		});

		await expect(query.findOrder(12 as never)).resolves.toMatchObject({
			dtmRequestStatus: "SUCCESS",
			dtmResponseStatus: "ACCEPTED",
			dtmSubmittedAt: "2026-10-04T12:00:00.000Z",
		});
	});

	it("returns null DTM status when an order has not been submitted", async () => {
		await expect(query.findOrder(12 as never)).resolves.toMatchObject({
			dtmRequestStatus: null,
			dtmResponseStatus: null,
			dtmSubmittedAt: null,
		});
	});

	it.each([
		[
			"findOrderIdByNumber",
			{ where: { orderNumber: "ORD-ABCDEFGHJK" }, columns: { id: true } },
		],
		[
			"findOrderForOwnership",
			{ where: { id: 12 }, columns: { createdByUserId: true } },
		],
		[
			"findOrderForOwnershipByNumber",
			{
				where: { orderNumber: "ORD-ABCDEFGHJK" },
				columns: { createdByUserId: true },
			},
		],
		[
			"findOrderForAccess",
			{
				where: { id: 12 },
				columns: { id: true, customerId: true, createdByUserId: true },
			},
		],
		[
			"findOrderForAccessByNumber",
			{
				where: { orderNumber: "ORD-ABCDEFGHJK" },
				columns: { id: true, customerId: true, createdByUserId: true },
			},
		],
		[
			"findOrderStatus",
			{
				where: { id: 12 },
				columns: { statusId: true, orderNumber: true, createdByUserId: true },
			},
		],
	] as const)(
		"uses a narrow ownership query for %s",
		async (method, expected) => {
			if (method === "findOrderIdByNumber") {
				await query.findOrderIdByNumber("ORD-ABCDEFGHJK");
			} else if (method === "findOrderForOwnership") {
				await query.findOrderForOwnership(12 as never);
			} else if (method === "findOrderForOwnershipByNumber") {
				await query.findOrderForOwnershipByNumber("ORD-ABCDEFGHJK");
			} else if (method === "findOrderForAccess") {
				await query.findOrderForAccess(12 as never);
			} else if (method === "findOrderForAccessByNumber") {
				await query.findOrderForAccessByNumber("ORD-ABCDEFGHJK");
			} else {
				await query.findOrderStatus(12 as never);
			}

			expect(findFirst).toHaveBeenCalledWith(expected);
		},
	);
});

describe("OrdersQuery persistence helpers", () => {
	it("creates an order and returns its generated identifier", async () => {
		const order = { id: 42, customerId: 3 };
		const returning = jest.fn().mockResolvedValue([{ id: order.id }]);
		const values = jest.fn().mockReturnValue({ returning });
		const insert = jest.fn().mockReturnValue({ values });
		const query = new OrdersQuery({ db: { insert } } as never);

		await expect(query.createOrder(order as never)).resolves.toEqual({
			id: order.id,
		});
		expect(insert).toHaveBeenCalledWith(orders);
		expect(values).toHaveBeenCalledWith(order);
		expect(returning).toHaveBeenCalledWith({ id: orders.id });
	});

	it("deletes an order and returns its identifier", async () => {
		const returning = jest.fn().mockResolvedValue([{ id: 42 }]);
		const where = jest.fn().mockReturnValue({ returning });
		const remove = jest.fn().mockReturnValue({ where });
		const query = new OrdersQuery({ db: { delete: remove } } as never);

		await expect(query.deleteOrder(42 as never)).resolves.toEqual({ id: 42 });
		expect(remove).toHaveBeenCalledWith(orders);
		expect(where).toHaveBeenCalledWith(expect.anything());
		expect(returning).toHaveBeenCalledWith({ id: orders.id });
	});
});

describe("OrdersQuery status updates", () => {
	function makeQuery({
		previousStatusId = "status-open",
		updated = { id: 12 },
	}: {
		previousStatusId?: string | null;
		updated?: { id: number } | null;
	} = {}) {
		const findFirst = jest
			.fn()
			.mockResolvedValue(
				previousStatusId === null ? undefined : { statusId: previousStatusId },
			);
		const returning = jest.fn().mockResolvedValue(updated ? [updated] : []);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const insertValues = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn().mockReturnValue({ values: insertValues });
		const update = jest.fn().mockReturnValue({ set });
		const tx = { query: { orders: { findFirst } }, update, insert };
		const transaction = jest.fn((run) => run(tx));
		const query = new OrdersQuery({ db: { transaction } } as never);
		return { query, findFirst, update, insert, insertValues, transaction };
	}

	it("records a status transition and notification in the same transaction", async () => {
		const { query, findFirst, update, insert, insertValues, transaction } =
			makeQuery();
		const notification = { recipientUserId: 8 } as never;

		await expect(
			query.updateOrder(12 as never, { statusId: "status-approved" } as never, {
				history: { userId: 7 as never, comment: "Approved" },
				notification,
			}),
		).resolves.toEqual({ id: 12 });

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(findFirst).toHaveBeenCalledWith({
			where: { id: 12 },
			columns: { statusId: true },
		});
		expect(update).toHaveBeenCalledWith(orders);
		expect(insert).toHaveBeenNthCalledWith(1, orderStatusHistory);
		expect(insertValues).toHaveBeenNthCalledWith(1, {
			orderId: 12,
			statusId: "status-approved",
			changedById: 7,
			comment: "Approved",
		});
		expect(insert).toHaveBeenNthCalledWith(2, notifications);
		expect(insertValues).toHaveBeenNthCalledWith(2, notification);
	});

	it("does not write transition history when the status stays the same", async () => {
		const { query, findFirst, insert } = makeQuery();

		await query.updateOrder(12 as never, { statusId: "status-open" } as never, {
			history: { userId: 7 as never },
		});

		expect(findFirst).toHaveBeenCalledTimes(1);
		expect(insert).not.toHaveBeenCalled();
	});

	it("writes transition history without a notification when none is supplied", async () => {
		const { query, insert } = makeQuery();

		await query.updateOrder(
			12 as never,
			{ statusId: "status-approved" } as never,
			{ history: { userId: 7 as never } },
		);

		expect(insert).toHaveBeenCalledTimes(1);
		expect(insert).toHaveBeenCalledWith(orderStatusHistory);
	});

	it("does not create history when the previous status cannot be found", async () => {
		const { query, insert } = makeQuery({ previousStatusId: null });

		await query.updateOrder(
			12 as never,
			{ statusId: "status-approved" } as never,
			{ history: { userId: 7 as never } },
		);

		expect(insert).not.toHaveBeenCalled();
	});

	it("does not load or record status history for non-status updates", async () => {
		const { query, findFirst, insert } = makeQuery();

		await query.updateOrder(
			12 as never,
			{ supervisor: "Updated supervisor" } as never,
			{ history: { userId: 7 as never } },
		);

		expect(findFirst).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});

	it("throws a stable conflict when an optimistic update matches no order", async () => {
		const { query, insert } = makeQuery({ updated: null });

		await expect(
			query.updateOrder(
				12 as never,
				{ supervisor: "Updated supervisor" } as never,
				{ history: { userId: 7 as never } },
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_UPDATE_CONFLICT },
		});
		expect(insert).not.toHaveBeenCalled();
	});
});
