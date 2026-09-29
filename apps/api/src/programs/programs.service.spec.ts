import { OrderStatus, ProgramStatus, Role } from "@ecommand/shared";
import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

describe("ProgramsService lifecycle", () => {
	const notifyChange = jest.fn();
	const toCreate = jest.fn();
	const query = {
		createProgram: jest.fn(),
		findOrderCustomer: jest.fn(),
		findProgramForOrder: jest.fn(),
		findProgram: jest.fn(),
		findProgramStatus: jest.fn(),
		updateProgram: jest.fn(),
	};
	const service = new ProgramsService(
		{ notifyChange } as never,
		query as unknown as ProgramsQuery,
		{ toCreate } as never,
	);
	const id = 5 as ProgramId;
	const user = { id: 7, role: Role.ADMIN, customerId: null } as never;

	beforeEach(() => {
		query.createProgram.mockReset();
		query.findOrderCustomer.mockReset().mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		});
		query.findProgramForOrder.mockReset();
		query.findProgram.mockReset();
		query.findProgramStatus.mockReset();
		query.updateProgram.mockReset();
		notifyChange.mockReset();
		toCreate.mockReset();
	});

	it("creates the first forecast program for an order", async () => {
		const dto = { orderId: 12 } as never;
		const values = { orderId: 12 } as never;
		const program = { id };
		query.findOrderCustomer.mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		} as never);
		query.findProgramForOrder.mockResolvedValue(undefined);
		toCreate.mockReturnValue(values);
		query.createProgram.mockResolvedValue({ id });
		query.findProgram.mockResolvedValue(program);

		await expect(service.create(dto, user)).resolves.toBe(program);
		expect(toCreate).toHaveBeenCalledWith(dto, user);
		expect(query.createProgram).toHaveBeenCalledWith(values);
	});

	it("rejects a missing order before attempting to create a program", async () => {
		query.findOrderCustomer.mockResolvedValue(undefined);

		await expect(
			service.create({ orderId: 12 } as never, user),
		).rejects.toThrow(new NotFoundException("Order 12 not found"));
		expect(query.findProgramForOrder).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("rejects an order that is not eligible for a program", async () => {
		query.findOrderCustomer.mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.DRAFT },
		} as never);

		await expect(
			service.create({ orderId: 12 } as never, user),
		).rejects.toThrow(
			new ConflictException("Order is not eligible for program creation"),
		);
		expect(query.findProgramForOrder).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("allows an agent to create a program for an assigned customer's order", async () => {
		query.findOrderCustomer.mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		} as never);
		query.findProgramForOrder.mockResolvedValue(undefined);
		toCreate.mockReturnValue({ orderId: 12 } as never);
		query.createProgram.mockResolvedValue({ id });
		query.findProgram.mockResolvedValue({ id } as never);
		const agent = {
			id: 7,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [42],
		} as never;

		await expect(
			service.create({ orderId: 12 } as never, agent),
		).resolves.toEqual({ id });
	});

	it("denies an unassigned agent from creating a program", async () => {
		query.findOrderCustomer.mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		} as never);
		const agent = {
			id: 7,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [],
		} as never;

		await expect(
			service.create({ orderId: 12 } as never, agent),
		).rejects.toBeInstanceOf(ForbiddenException);
		expect(query.findProgramForOrder).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("denies an agent outside the order customer's portfolio", async () => {
		query.findOrderCustomer.mockResolvedValue({ customerId: 42 });
		const agent = {
			id: 7,
			role: Role.AGENT_COMMERCIAL,
			customerId: null,
			assignedCustomerIds: [43],
		} as never;

		await expect(
			service.create({ orderId: 12 } as never, agent),
		).rejects.toBeInstanceOf(ForbiddenException);
		expect(query.findProgramForOrder).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("rejects creating a second program for the same order", async () => {
		query.findOrderCustomer.mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		} as never);
		query.findProgramForOrder.mockResolvedValue({ id });

		await expect(
			service.create({ orderId: 12 } as never, user),
		).rejects.toThrow("This order already has a forecast program");
		expect(toCreate).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("submits a draft program with a conditional status update and notification", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
		});
		query.updateProgram.mockResolvedValue({ id });
		const result = {
			id,
			createdByUserId: 20,
			programStatus: { name: ProgramStatus.PENDING_APPROVAL },
		};
		query.findProgram.mockResolvedValue(result);
		await expect(service.submit(id, user)).resolves.toBe(result);
		expect(query.updateProgram).toHaveBeenCalledWith(
			id,
			{ statusId: PROGRAM_STATUSES[ProgramStatus.PENDING_APPROVAL].id },
			expect.anything(),
		);
		expect(notifyChange).toHaveBeenCalledWith(
			20,
			7,
			"programs",
			id,
			expect.stringContaining("pending approval"),
		);
	});

	it("rejects transitions that are not valid from the current state", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id,
		});
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(query.updateProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});

	it("rejects an unknown status reference", async () => {
		query.findProgramStatus.mockResolvedValue({ statusId: "missing-status" });
		await expect(service.submit(id, user)).rejects.toThrow("Invalid status");
		expect(query.updateProgram).not.toHaveBeenCalled();
	});

	it("returns not found when the program does not exist", async () => {
		query.findProgramStatus.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});

	it("reports a conflict if another request changes the program first", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
		});
		query.updateProgram.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(query.findProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});
});
