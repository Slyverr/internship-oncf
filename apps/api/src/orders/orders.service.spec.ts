import { OrderStatus } from "@ecommand/shared";
import { ConflictException, NotFoundException } from "@nestjs/common";
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
		).rejects.toBeInstanceOf(NotFoundException);
	});
});
