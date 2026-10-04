import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import type { ProgramDetail } from "@/programs/programs.types";
import { DtmQuery } from "./dtm.query";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

describe("DtmSimulatorAdapter", () => {
	const createOrderRequest = jest.fn().mockResolvedValue({ id: 92 });
	const completeOrderRequest = jest.fn().mockResolvedValue(undefined);
	const createProgramRequest = jest.fn().mockResolvedValue({ id: 91 });
	const completeProgramRequest = jest.fn().mockResolvedValue(undefined);
	const query = {
		createOrderRequest,
		completeOrderRequest,
		createProgramRequest,
		completeProgramRequest,
	};
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
		completeOrderRequest.mockReset().mockResolvedValue(undefined);
		createProgramRequest.mockReset().mockResolvedValue({ id: 91 });
		completeProgramRequest.mockReset().mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("records one mock request and applies its delayed acceptance", async () => {
		const values: Record<string, unknown> = { DTM_MODE: "simulator" };
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
		);

		await service.submitProgram(program, user);

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
		expect(completeProgramRequest).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync(1_999);
		expect(completeProgramRequest).not.toHaveBeenCalled();
		await jest.advanceTimersByTimeAsync(1);
		expect(completeProgramRequest).toHaveBeenCalledWith(
			91,
			5,
			"ACCEPTED",
			2_000,
		);
		service.onModuleDestroy();
	});

	it("records a delayed rejection when configured", async () => {
		const values: Record<string, unknown> = {
			DTM_MODE: "simulator",
			DTM_SIMULATOR_DELAY_MS: "10",
			DTM_SIMULATOR_RESULT: "REJECTED",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
		);

		await service.submitProgram(program, user);
		await jest.advanceTimersByTimeAsync(10);

		expect(completeProgramRequest).toHaveBeenCalledWith(91, 5, "REJECTED", 10);
		service.onModuleDestroy();
	});

	it("records and acknowledges an order submission using simulator settings", async () => {
		const values: Record<string, unknown> = {
			DTM_SIMULATOR_DELAY_MS: "5",
			DTM_SIMULATOR_RESULT: "ACCEPTED",
		};
		const config = {
			get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
		} as unknown as ConfigService;
		const service = new DtmSimulatorAdapter(
			config,
			query as unknown as DtmQuery,
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
		expect(completeOrderRequest).not.toHaveBeenCalled();
		await jest.advanceTimersByTimeAsync(5);
		expect(completeOrderRequest).toHaveBeenCalledWith(92, "ACCEPTED", 5);
		service.onModuleDestroy();
	});
});
