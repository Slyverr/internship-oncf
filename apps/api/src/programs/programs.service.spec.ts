import {
	API_ERROR_CODES,
	NotificationMessageCode,
	OrderStatus,
	Permission,
	ProgramStatus,
	Role,
} from "@ecommand/shared";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

describe("ProgramsService lifecycle", () => {
	const notifyChange = jest.fn();
	const createChangeRecord = jest.fn().mockReturnValue({ id: "notification" });
	const toCreate = jest.fn();
	const query = {
		createProgram: jest.fn(),
		findOrderCustomer: jest.fn(),
		findProgramForOrder: jest.fn(),
		findProgram: jest.fn(),
		findProgramIdByNumber: jest.fn(),
		findProgramStatus: jest.fn(),
		updateProgram: jest.fn(),
	};
	const service = new ProgramsService(
		{ notifyChange, createChangeRecord } as never,
		query as unknown as ProgramsQuery,
		{ toCreate } as never,
	);
	const id = 5 as ProgramId;
	const user = {
		id: 7,
		email: "admin@example.test",
		role: Role.ADMIN,
		permissions: new Set([Permission.CUSTOMERS_MANAGE_OTHER]),
		customerId: null,
		assignedCustomerIds: [],
	} as never;

	beforeEach(() => {
		query.createProgram.mockReset();
		query.findOrderCustomer.mockReset().mockResolvedValue({
			customerId: 42,
			orderStatus: { name: OrderStatus.APPROVED },
		});
		query.findProgramForOrder.mockReset();
		query.findProgram.mockReset();
		query.findProgramIdByNumber.mockReset();
		query.findProgramStatus.mockReset();
		query.updateProgram.mockReset();
		notifyChange.mockReset();
		createChangeRecord.mockClear();
		toCreate.mockReset();
	});

	it("resolves a public program number to its internal relation ID", async () => {
		query.findProgramIdByNumber.mockResolvedValue({ id: 27 });
		await expect(service.resolveProgramId("PRG-ABCDEFGHIJ")).resolves.toBe(27);
		expect(query.findProgramIdByNumber).toHaveBeenCalledWith("PRG-ABCDEFGHIJ");
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
		expect(query.createProgram).toHaveBeenCalledWith(values, {
			userId: 7,
			userName: "admin@example.test",
		});
	});

	it("rejects a missing order before attempting to create a program", async () => {
		query.findOrderCustomer.mockResolvedValue(undefined);

		await expect(
			service.create({ orderId: 12 } as never, user),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_NOT_FOUND },
		});
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
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_NOT_ELIGIBLE_FOR_PROGRAM },
		});
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
			permissions: new Set(),
			customerId: null,
			assignedCustomerIds: [],
		} as never;

		await expect(
			service.create({ orderId: 12 } as never, agent),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_CUSTOMER_ACCESS_DENIED },
		});
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
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_CUSTOMER_ACCESS_DENIED },
		});
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
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ORDER_ALREADY_PROGRAMMED },
		});
		expect(toCreate).not.toHaveBeenCalled();
		expect(query.createProgram).not.toHaveBeenCalled();
	});

	it("submits a draft program with a conditional status update and notification", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
			programNumber: "PRG-ABCDEFGHJK",
			createdByUserId: 20,
		});
		query.updateProgram.mockResolvedValue({ id });
		const result = {
			id,
			programNumber: "PRG-ABCDEFGHJK",
			createdByUserId: 20,
			programStatus: { name: ProgramStatus.PENDING_APPROVAL },
		};
		query.findProgram.mockResolvedValue(result);
		await expect(service.submit(id, user)).resolves.toBe(result);
		expect(query.updateProgram).toHaveBeenCalledWith(
			id,
			{ statusId: PROGRAM_STATUSES[ProgramStatus.PENDING_APPROVAL].id },
			expect.anything(),
			{ userId: 7, userName: "admin@example.test" },
			{ id: "notification" },
		);
		expect(createChangeRecord).toHaveBeenCalledWith(20, 7, "programs", id, {
			code: NotificationMessageCode.PROGRAM_STATUS_CHANGED,
			parameters: {
				recordCode: result.programNumber,
				status: ProgramStatus.PENDING_APPROVAL,
			},
		});
	});

	it("rejects transitions that are not valid from the current state", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id,
		});
		await expect(service.submit(id, user)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID },
		});
		expect(query.updateProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});

	it("rejects an unknown status reference", async () => {
		query.findProgramStatus.mockResolvedValue({ statusId: "missing-status" });
		await expect(service.submit(id, user)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID },
		});
		expect(query.updateProgram).not.toHaveBeenCalled();
	});

	it("returns not found when the program does not exist", async () => {
		query.findProgramStatus.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_NOT_FOUND },
		});
	});

	it("reports a conflict if another request changes the program first", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
		});
		query.updateProgram.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID },
		});
		expect(query.findProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});
});
