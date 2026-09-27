import { Permission } from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { OrdersQuery } from "./orders.query";

const createUser = (id: number, permissions: Permission[] = []) =>
	({ id, permissions: new Set(permissions) }) as AuthUser;

describe("OrdersQuery authorization scope", () => {
	const findMany = jest.fn();
	const query = new OrdersQuery({
		db: { query: { orders: { findMany } } },
	} as never);
	beforeEach(() => {
		findMany.mockReset().mockResolvedValue([]);
	});

	it("restricts ordinary order lists to the authenticated creator", async () => {
		const user = createUser(17);
		await query.findOrders(user, {
			page: 2,
			limit: 10,
			search: "steel",
			status: "approved",
		} as never);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					createdByUserId: user.id,
					status: "approved",
					OR: expect.arrayContaining([
						expect.objectContaining({ orderNumber: { ilike: "%steel%" } }),
					]),
				}),
				limit: 10,
				offset: 10,
			}),
		);
	});

	it("allows cross-user lists only with the manage-other permission", async () => {
		const user = createUser(17, [Permission.ORDERS_MANAGE_OTHER]);
		await query.findOrders(user, { page: 1, limit: 20 } as never);
		const options = findMany.mock.calls[0][0];
		expect(options.where).not.toHaveProperty("createdByUserId");
		expect(options.limit).toBe(20);
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
	});
});
