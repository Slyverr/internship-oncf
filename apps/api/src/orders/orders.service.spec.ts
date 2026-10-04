import { API_ERROR_CODES, OrderStatus } from "@ecommand/shared";
import { ConflictException } from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { OrdersQuery } from "./orders.query";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";

describe("OrdersService deletion", () => {
	const findOrder = jest.fn();
	const deleteOrder = jest.fn();
	const service = new OrdersService(
		{} as never,
		{ findOrder, deleteOrder } as unknown as OrdersQuery,
		{} as never,
		{} as never,
	);
	const id = 5 as OrderId;

	beforeEach(() => {
		findOrder.mockReset();
		deleteOrder.mockReset();
	});

	it("deletes a draft order", async () => {
		findOrder.mockResolvedValue({ orderStatus: { name: OrderStatus.DRAFT } });
		deleteOrder.mockResolvedValue({ id });
		await expect(service.remove(id)).resolves.toEqual({ id });
		expect(deleteOrder).toHaveBeenCalledWith(id);
	});

	it.each([OrderStatus.SUBMITTED, OrderStatus.APPROVED, OrderStatus.COMPLETED])(
		"rejects deletion for an order in %s status",
		async (status) => {
			findOrder.mockResolvedValue({ orderStatus: { name: status } });
			await expect(service.remove(id)).rejects.toBeInstanceOf(
				ConflictException,
			);
			expect(deleteOrder).not.toHaveBeenCalled();
		},
	);
});

describe("OrdersService public code resolution", () => {
	const findOrderIdByNumber = jest.fn();
	const service = new OrdersService(
		{} as never,
		{ findOrderIdByNumber } as unknown as OrdersQuery,
		{} as never,
		{} as never,
	);

	beforeEach(() => findOrderIdByNumber.mockReset());

	it("resolves a public order number to its internal relation ID", async () => {
		findOrderIdByNumber.mockResolvedValue({ id: 42 });
		await expect(service.resolveOrderId("ORD-ABCDEFGHIJ")).resolves.toBe(42);
		expect(findOrderIdByNumber).toHaveBeenCalledWith("ORD-ABCDEFGHIJ");
	});

	it("rejects an unknown public order number", async () => {
		findOrderIdByNumber.mockResolvedValue(undefined);
		await expect(
			service.resolveOrderId("ORD-ABCDEFGHIJ"),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_NOT_FOUND },
		});
	});
});

describe("OrdersService duplication", () => {
	it("creates a new draft from business fields only", async () => {
		const sourceId = 5 as OrderId;
		const actor: AuthUser = {
			id: 9,
			email: "client@example.test",
			role: "CLIENT_REPRESENTATIVE" as never,
			permissions: new Set(),
			sessionId: "session",
			customerId: 42,
			agencyId: null,
			assignedCustomerIds: [],
		};
		const source = {
			id: 5,
			goodsId: 4,
			customerId: 42,
			supervisor: "A supervisor",
			movementTypeId: "movement",
			quantityDemanded: "25",
			quantityAchieved: "10",
			unitId: "unit",
			departureStationId: 1,
			debtorCustomerId: 2,
			pickupLocationTypeId: "pickup",
			dispatchTypeId: "dispatch",
			destinationCustomerId: 3,
			arrivalStationId: 4,
			deliveryLocationTypeId: "delivery",
			pickupPortId: 5,
			pickupBerthId: 6,
			pickupSidingId: 7,
			deliveryPortId: 8,
			deliveryBerthId: 9,
			deliverySidingId: 10,
			remarks: "business context",
			orderDate: "2026-10-01T00:00:00.000Z",
			startDate: null,
			endDate: "2026-10-31T00:00:00.000Z",
			orderStatus: { name: OrderStatus.COMPLETED },
			forecastPrograms: [{ id: 19 }],
			orderExecutions: [{ id: 20 }],
			orderFiles: [{ id: 21 }],
			parentOrderId: 2,
		};
		const findOrder = jest.fn().mockResolvedValue(source);
		const createOrder = jest.fn().mockResolvedValue({ id: 6 });
		const mapper = { toCreate: jest.fn().mockReturnValue({}) };
		const service = new OrdersService(
			{} as never,
			{ findOrder, createOrder } as unknown as OrdersQuery,
			mapper as never,
			{} as never,
		);

		await service.duplicate(sourceId, actor);

		expect(mapper.toCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				goodsId: 4,
				customerId: 42,
				quantityDemanded: "25",
				unitId: "unit",
				remarks: "business context",
			}),
			actor,
		);
		const duplicateDto = mapper.toCreate.mock.calls[0][0];
		expect(duplicateDto).not.toHaveProperty("status");
		expect(duplicateDto).not.toHaveProperty("quantityAchieved");
		expect(duplicateDto).not.toHaveProperty("parentOrderId");
		expect(createOrder).toHaveBeenCalledWith({});
	});
});
