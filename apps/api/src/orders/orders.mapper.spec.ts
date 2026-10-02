import {
	API_ERROR_CODES,
	OrderStatus,
	Permission,
	Role,
} from "@ecommand/shared";
import { OrdersMapper } from "./orders.mapper";

const mapper = new OrdersMapper();

const user = (customerId: number | null, permissions: Permission[] = []) => ({
	id: 4,
	email: "agent@example.test",
	role: Role.AGENT_COMMERCIAL,
	permissions: new Set<Permission>(permissions),
	sessionId: "test-session",
	customerId,
	agencyId: null,
	assignedCustomerIds: customerId === null ? [] : [customerId],
});

describe("OrdersMapper", () => {
	it("requires a customer when mapping an order without an assigned customer", () => {
		try {
			mapper.toCreate({} as never, user(null) as never);
			throw new Error("Expected an API exception");
		} catch (error) {
			expect(error).toMatchObject({
				response: { code: API_ERROR_CODES.ORDER_CUSTOMER_REQUIRED },
			});
		}
	});

	it("rejects creating an order for a customer outside the user portfolio", () => {
		try {
			mapper.toCreate({ customerId: 12 } as never, user(11) as never);
			throw new Error("Expected an API exception");
		} catch (error) {
			expect(error).toMatchObject({
				response: { code: API_ERROR_CODES.ORDER_CUSTOMER_ACCESS_DENIED },
			});
		}
	});

	it("rejects a status change without the status-management permission", () => {
		try {
			mapper.toUpdate(
				{ status: OrderStatus.APPROVED } as never,
				user(11) as never,
			);
			throw new Error("Expected an API exception");
		} catch (error) {
			expect(error).toMatchObject({
				response: { code: API_ERROR_CODES.ORDER_STATUS_CHANGE_FORBIDDEN },
			});
		}
	});
});
