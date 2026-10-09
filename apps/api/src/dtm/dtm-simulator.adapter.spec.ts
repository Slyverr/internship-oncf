import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import type { ProgramDetail } from "@/programs/programs.types";
import { DtmQuery } from "./dtm.query";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

describe("DtmSimulatorAdapter", () => {
	const createOrderRequest = jest.fn().mockResolvedValue({ id: 92 });
	const completion = {
		relatedEntityType: "orders",
		relatedEntityId: 12,
		relatedEntityCode: "ORD-ABCDEFGHIJ",
		createdByUserId: 7,
		relatedEntityOwnerUserId: 84,
	};
	const completeSimulatorRequest = jest.fn().mockResolvedValue(completion);
	const resolvePendingRequest = jest.fn().mockResolvedValue(completion);
	const createProgramRequest = jest.fn().mockResolvedValue({ id: 91 });
	const query = {
		createOrderRequest,
		completeSimulatorRequest,
		resolvePendingRequest,
		createProgramRequest,
	};
	const realtimeEvents = {
		publish: jest.fn(),
		publishToUser: jest.fn(),
	};
	const notifications = { create: jest.fn().mockResolvedValue(undefined) };
	const program = {
		id: 5,
		programNumber: "PRG-ABCDEFGHIJ",
		plannedDate: "2026-10-10T00:00:00.000Z",
		quantityPlanned: "125.000",
		order: { orderNumber: "ORD-ABCDEFGHIJ" },
	} as ProgramDetail;
	const user = { id: 7 } as AuthUser;
	const order = {
		id: 12,
		orderNumber: "ORD-ABCDEFGHIJ",
		customerId: 42,
		quantityDemanded: "250.000",
		orderDate: "2026-10-01T00:00:00.000Z",
	} as never;

	beforeEach(() => {
		jest.useFakeTimers();
		createOrderRequest.mockReset().mockResolvedValue({ id: 92 });
		completeSimulatorRequest.mockReset().mockResolvedValue(completion);
		resolvePendingRequest.mockReset().mockResolvedValue(completion);
		createProgramRequest.mockReset().mockResolvedValue({ id: 91 });
		realtimeEvents.publish.mockClear();
		realtimeEvents.publishToUser.mockClear();
		notifications.create.mockClear();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("records one mock request and applies its delayed acceptance", async () => {
		const values: Record<string, unknown> = {
			DTM_MODE: "simulator",
			DTM_SIMULATOR_RESPONSE_MODE: "auto",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);
		const programCompletion = {
			...completion,
			relatedEntityType: "forecast_programs",
			relatedEntityCode: "PRG-ABCDEFGHIJ",
		};
		completeSimulatorRequest.mockResolvedValue(programCompletion);

		await service.submitProgram(program, user);
		expect(realtimeEvents.publish).toHaveBeenCalledWith(
			"dtm.activity.changed",
			expect.objectContaining({
				requestId: 91,
				status: "PENDING",
				relatedEntityType: "forecast_programs",
				relatedEntityCode: "PRG-ABCDEFGHIJ",
			}),
			{ permission: expect.any(String), userId: user.id },
		);

		expect(createProgramRequest).toHaveBeenCalledWith(5, 7, {
			contract: "ecommand-dtm-simulator-v1",
			source: "ECommand",
			program: {
				programNumber: "PRG-ABCDEFGHIJ",
				orderNumber: "ORD-ABCDEFGHIJ",
				plannedDate: "2026-10-10T00:00:00.000Z",
				quantityPlanned: "125.000",
			},
		});
		expect(completeSimulatorRequest).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync(1_999);
		expect(completeSimulatorRequest).not.toHaveBeenCalled();
		await jest.advanceTimersByTimeAsync(1);
		expect(completeSimulatorRequest).toHaveBeenCalledWith(91, "ACCEPTED");
		expect(realtimeEvents.publish).toHaveBeenLastCalledWith(
			"dtm.activity.changed",
			expect.objectContaining({
				requestId: 91,
				status: "ACCEPTED",
				relatedEntityCode: "PRG-ABCDEFGHIJ",
			}),
			{ permission: expect.any(String), userId: user.id },
		);
		expect(notifications.create).toHaveBeenCalledWith({
			userId: 84,
			type: "DTM_RESPONSE",
			channel: "IN_APP",
			messageCode: "DTM_RESPONSE",
			messageParameters: {
				recordCode: "PRG-ABCDEFGHIJ",
				status: "ACCEPTED",
			},
			relatedEntityType: "programs",
			relatedEntityId: 12,
		});
		service.onModuleDestroy();
	});

	it("records a delayed rejection when configured", async () => {
		const values: Record<string, unknown> = {
			DTM_MODE: "simulator",
			DTM_SIMULATOR_RESPONSE_MODE: "auto",
			DTM_SIMULATOR_DELAY_SECONDS: "0.01",
			DTM_SIMULATOR_RESULT: "REJECTED",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);

		await service.submitProgram(program, user);
		await jest.advanceTimersByTimeAsync(10);

		expect(completeSimulatorRequest).toHaveBeenCalledWith(91, "REJECTED");
		service.onModuleDestroy();
	});

	it("records and acknowledges an order submission using simulator settings", async () => {
		const values: Record<string, unknown> = {
			DTM_SIMULATOR_RESPONSE_MODE: "auto",
			DTM_SIMULATOR_DELAY_SECONDS: "0.005",
			DTM_SIMULATOR_RESULT: "ACCEPTED",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);

		await service.submitOrder(order, user);

		expect(createOrderRequest).toHaveBeenCalledWith(12, 7, {
			contract: "ecommand-dtm-simulator-v1",
			source: "ECommand",
			order: {
				orderNumber: "ORD-ABCDEFGHIJ",
				customerId: 42,
				quantityDemanded: "250.000",
				orderDate: "2026-10-01T00:00:00.000Z",
			},
		});
		expect(completeSimulatorRequest).not.toHaveBeenCalled();
		await jest.advanceTimersByTimeAsync(5);
		expect(completeSimulatorRequest).toHaveBeenCalledWith(92, "ACCEPTED");
		expect(notifications.create).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 84,
				messageCode: "DTM_RESPONSE",
				messageParameters: {
					recordCode: "ORD-ABCDEFGHIJ",
					status: "ACCEPTED",
				},
			}),
		);
		service.onModuleDestroy();
	});

	it("clamps a negative automatic delay to zero", async () => {
		const values: Record<string, unknown> = {
			DTM_SIMULATOR_RESPONSE_MODE: "auto",
			DTM_SIMULATOR_DELAY_SECONDS: "-0.025",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);

		await service.submitOrder(order, user);
		await jest.advanceTimersByTimeAsync(0);

		expect(completeSimulatorRequest).toHaveBeenCalledWith(92, "ACCEPTED");
		service.onModuleDestroy();
	});

	it("allows an admin resolution to override and cancel an automatic response", async () => {
		const config = {
			get: jest.fn((key: string, fallback: unknown) =>
				key === "DTM_SIMULATOR_RESPONSE_MODE" ? "auto" : fallback,
			),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);

		await service.submitOrder(order, user);
		await jest.advanceTimersByTimeAsync(2);

		await expect(
			service.resolvePendingRequest(92, "REJECTED", 99),
		).resolves.toEqual(completion);
		expect(resolvePendingRequest).toHaveBeenCalledWith(92, "REJECTED", 99);

		await jest.advanceTimersByTimeAsync(2_000);
		expect(completeSimulatorRequest).not.toHaveBeenCalled();
		service.onModuleDestroy();
	});

	it("keeps requests pending for admin review by default", async () => {
		const config = {
			get: jest.fn((_key: string, fallback: unknown) => fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
			realtimeEvents as never,
			notifications as never,
		);

		await service.submitOrder(order, user);
		expect(realtimeEvents.publish).toHaveBeenCalledWith(
			"dtm.request.pending",
			{
				requestId: 92,
				relatedEntityType: "orders",
				relatedEntityCode: "ORD-ABCDEFGHIJ",
			},
			{ permission: expect.any(String) },
		);
		await jest.advanceTimersByTimeAsync(60_000);

		expect(completeSimulatorRequest).not.toHaveBeenCalled();
		expect(service.getResponseMode()).toBe("MANUAL");
		service.onModuleDestroy();
	});
});
