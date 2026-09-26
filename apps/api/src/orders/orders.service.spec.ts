import { OrderStatus } from "@ecommand/shared";
import { ConflictException } from "@nestjs/common";
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
