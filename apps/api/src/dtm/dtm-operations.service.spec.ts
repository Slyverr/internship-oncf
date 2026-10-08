import { ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DtmQuery } from "./dtm.query";
import { DtmOperationsService } from "./dtm-operations.service";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

describe("DtmOperationsService", () => {
	const findRecentRequests = jest.fn();
	const resolvePendingRequest = jest.fn();
	const getResponseMode = jest.fn();
	let values: Record<string, string>;
	let service: DtmOperationsService;

	beforeEach(() => {
		values = {
			DTM_MODE: "simulator",
			DTM_SIMULATOR_RESPONSE_MODE: "manual",
		};
		findRecentRequests.mockReset().mockResolvedValue([
			{
				id: 1,
				dtmRequestType: { name: "Submit order to DTM" },
				status: "PENDING",
			},
		]);
		resolvePendingRequest.mockReset().mockResolvedValue(true);
		getResponseMode
			.mockReset()
			.mockImplementation(() =>
				values.DTM_SIMULATOR_RESPONSE_MODE === "auto" ? "AUTO" : "MANUAL",
			);
		service = new DtmOperationsService(
			{
				get: jest.fn(
					(key: string, fallback?: string) => values[key] ?? fallback,
				),
			} as unknown as ConfigService,
			{ findRecentRequests } as unknown as DtmQuery,
			{
				resolvePendingRequest,
				getResponseMode,
			} as unknown as DtmSimulatorAdapter,
		);
	});

	it("lists recent requests and identifies simulator mode", async () => {
		await expect(service.list()).resolves.toEqual({
			mode: "SIMULATOR",
			responseMode: "MANUAL",
			requests: [
				{
					id: 1,
					requestType: "Submit order to DTM",
					status: "PENDING",
				},
			],
		});
	});

	it("reports automatic response mode when enabled", async () => {
		values.DTM_SIMULATOR_RESPONSE_MODE = "auto";
		await expect(service.list()).resolves.toMatchObject({
			mode: "SIMULATOR",
			responseMode: "AUTO",
		});
	});

	it("lets an admin resolve a pending request while simulation is active", async () => {
		await expect(service.resolve(1, "ACCEPTED", 7)).resolves.toEqual({
			id: 1,
			result: "ACCEPTED",
			status: "SUCCESS",
		});
		expect(resolvePendingRequest).toHaveBeenCalledWith(1, "ACCEPTED", 7);
	});

	it("rejects manual responses when simulation is disabled", async () => {
		values.DTM_MODE = "disabled";

		await expect(service.resolve(1, "REJECTED", 7)).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(resolvePendingRequest).not.toHaveBeenCalled();
	});

	it("rejects requests that are no longer pending", async () => {
		resolvePendingRequest.mockResolvedValue(false);

		await expect(service.resolve(1, "REJECTED", 7)).rejects.toBeInstanceOf(
			ConflictException,
		);
	});
});
