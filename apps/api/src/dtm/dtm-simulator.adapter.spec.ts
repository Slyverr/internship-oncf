import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import type { ProgramDetail } from "@/programs/programs.types";
import { DtmQuery } from "./dtm.query";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

describe("DtmSimulatorAdapter", () => {
	const createProgramRequest = jest.fn().mockResolvedValue({ id: 91 });
	const completeProgramRequest = jest.fn().mockResolvedValue(undefined);
	const query = {
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

	beforeEach(() => {
		jest.useFakeTimers();
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
});
