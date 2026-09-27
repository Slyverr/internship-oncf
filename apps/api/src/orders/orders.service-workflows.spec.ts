import { OrderStatus, Permission, Role } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { ORDER_STATUSES } from "@/database/reference-data";
import type { OrdersMapper } from "./orders.mapper";
import type { OrdersQuery } from "./orders.query";
import { OrdersService } from "./orders.service";
import type { OrderId } from "./orders.types";

const id = 31 as OrderId;
const user: AuthUser = {
	id: 7,
	email: "agent@example.test",
	role: Role.AGENT_COMMERCIAL,
	permissions: new Set([Permission.ORDERS_UPDATE]),
	sessionId: "session-1",
	customerId: 42,
	agencyId: null,
};
const draftOrder = {
	id,
	createdByUserId: user.id,
	customerId: 42,
	statusId: ORDER_STATUSES[OrderStatus.DRAFT].id,
	orderStatus: { name: OrderStatus.DRAFT },
	startDate: null,
	endDate: null,
};

describe("OrdersService workflows", () => {
	let service: OrdersService;
	let query: jest.Mocked<OrdersQuery>;
	let mapper: jest.Mocked<OrdersMapper>;
	let notifications: { notifyChange: jest.Mock };

	beforeEach(() => {
		query = {
			findOrder: jest.fn(),
			findOrderStatus: jest.fn(),
			updateOrder: jest.fn(),
		} as unknown as jest.Mocked<OrdersQuery>;
		mapper = { toUpdate: jest.fn() } as unknown as jest.Mocked<OrdersMapper>;
		notifications = { notifyChange: jest.fn().mockResolvedValue(undefined) };
		service = new OrdersService(notifications as never, query, mapper);
		query.findOrder.mockResolvedValue(draftOrder as never);
		query.updateOrder.mockResolvedValue(undefined as never);
	});

	it("maps and updates draft details with optimistic status and history context", async () => {
		const values = { quantityDemanded: "250.000" };
		mapper.toUpdate.mockReturnValue(values as never);
		expect(
			await service.update(id, { quantityDemanded: "250.000" }, user),
		).toEqual(draftOrder);
		expect(mapper.toUpdate).toHaveBeenCalledWith(
			{ quantityDemanded: "250.000" },
			user,
		);
		expect(query.updateOrder).toHaveBeenCalledWith(
			id,
			values,
			expect.objectContaining({ history: { userId: user.id } }),
		);
	});

	it("rejects detail edits after an order leaves draft", async () => {
		query.findOrder.mockResolvedValue({
			...draftOrder,
			orderStatus: { name: OrderStatus.SUBMITTED },
		} as never);
		await expect(
			service.update(id, { supervisor: "New supervisor" }, user),
		).rejects.toBeInstanceOf(ConflictException);
		expect(query.updateOrder).not.toHaveBeenCalled();
	});

	it("rejects customer changes without ownership permission", async () => {
		await expect(service.update(id, { customerId: 99 }, user)).rejects.toThrow(
			new ForbiddenException("Cannot change order ownership"),
		);
		expect(mapper.toUpdate).not.toHaveBeenCalled();
	});

	it("allows an ownership manager to change the customer", async () => {
		const manager = {
			...user,
			permissions: new Set([
				Permission.ORDERS_UPDATE,
				Permission.ORDERS_MANAGE_OWNERSHIP,
			]),
		};
		mapper.toUpdate.mockReturnValue({ customerId: 99 } as never);
		await service.update(id, { customerId: 99 }, manager);
		expect(query.updateOrder).toHaveBeenCalledWith(
			id,
			{ customerId: 99 },
			expect.any(Object),
		);
	});

	it.each(["0", "-1", "1.2345", "invalid"])(
		"rejects invalid demanded quantities: %s",
		async (quantityDemanded) => {
			await expect(
				service.update(id, { quantityDemanded }, user),
			).rejects.toBeInstanceOf(BadRequestException);
			expect(mapper.toUpdate).not.toHaveBeenCalled();
		},
	);

	it("rejects an end date before the start date", async () => {
		query.findOrder.mockResolvedValue({
			...draftOrder,
			startDate: "2025-03-10T00:00:00.000Z",
		} as never);
		await expect(
			service.update(id, { endDate: "2025-03-09T00:00:00.000Z" }, user),
		).rejects.toThrow(
			new BadRequestException(
				"The completion date must be on or after the start date",
			),
		);
	});

	it("reports a missing order during update", async () => {
		query.findOrder.mockResolvedValue(undefined);
		await expect(
			service.update(id, { supervisor: "New" }, user),
		).rejects.toThrow(new NotFoundException("Order 31 not found"));
	});

	it("submits an order and notifies its creator after persistence", async () => {
		query.findOrderStatus.mockResolvedValue({
			statusId: ORDER_STATUSES[OrderStatus.DRAFT].id,
		} as never);
		query.findOrder.mockResolvedValue({
			...draftOrder,
			orderStatus: { name: OrderStatus.SUBMITTED },
		} as never);

		await service.submit(id, user);

		expect(query.updateOrder).toHaveBeenCalledWith(
			id,
			{ statusId: ORDER_STATUSES[OrderStatus.SUBMITTED].id },
			expect.objectContaining({
				history: { userId: user.id, comment: undefined },
			}),
		);
		expect(notifications.notifyChange).toHaveBeenCalledWith(
			draftOrder.createdByUserId,
			user.id,
			"orders",
			id,
			"Order #31 is now submitted.",
		);
	});

	it("rejects a transition from an unknown stored status", async () => {
		query.findOrderStatus.mockResolvedValue({
			statusId: "unknown-status",
		} as never);
		await expect(service.submit(id, user)).rejects.toThrow(
			new ConflictException("Invalid status unknown-status for order 31"),
		);
		expect(query.updateOrder).not.toHaveBeenCalled();
	});

	it("rejects transitions that are not allowed from the current status", async () => {
		query.findOrderStatus.mockResolvedValue({
			statusId: ORDER_STATUSES[OrderStatus.DRAFT].id,
		} as never);
		await expect(service.approve(id, user)).rejects.toThrow(
			new ConflictException("Cannot transition from DRAFT to APPROVED"),
		);
		expect(query.updateOrder).not.toHaveBeenCalled();
	});

	it("reports a missing order during a transition", async () => {
		query.findOrderStatus.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toThrow(
			new NotFoundException("Order 31 not found"),
		);
	});
});
