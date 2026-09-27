import { NotFoundException } from "@nestjs/common";
import type { TrackingQuery } from "./tracking.query";
import { TrackingService } from "./tracking.service";

describe("TrackingService", () => {
	const query = {
		findTrackedWagon: jest.fn(),
		findTrackedTrain: jest.fn(),
		findTrackedOrder: jest.fn(),
		findWagonExists: jest.fn(),
		findTrainExists: jest.fn(),
		createWagonTracking: jest.fn(),
		updateTrainPosition: jest.fn(),
	} as unknown as jest.Mocked<TrackingQuery>;
	const service = new TrackingService(query);
	beforeEach(() => {
		for (const fn of Object.values(query))
			if (typeof fn === "function") (fn as jest.Mock).mockReset();
	});

	it("returns matching wagon tracking data", async () => {
		query.findTrackedWagon.mockResolvedValue({ id: 3 } as never);
		await expect(service.trackWagon("W-3")).resolves.toEqual({ id: 3 });
		expect(query.findTrackedWagon).toHaveBeenCalledWith("W-3");
	});
	it("reports missing wagons", async () => {
		query.findTrackedWagon.mockResolvedValue(undefined);
		await expect(service.trackWagon("W-404")).rejects.toThrow(
			new NotFoundException("Wagon W-404 not found"),
		);
	});
	it("returns matching train tracking data", async () => {
		query.findTrackedTrain.mockResolvedValue({ id: 4 } as never);
		await expect(service.trackTrain("T-4")).resolves.toEqual({ id: 4 });
		expect(query.findTrackedTrain).toHaveBeenCalledWith("T-4");
	});
	it("reports missing trains", async () => {
		query.findTrackedTrain.mockResolvedValue(undefined);
		await expect(service.trackTrain("T-404")).rejects.toThrow(
			new NotFoundException("Train T-404 not found"),
		);
	});
	it("returns order tracking results", async () => {
		query.findTrackedOrder.mockResolvedValue([{ wagonId: 2 }] as never);
		await expect(service.trackOrder(12)).resolves.toEqual([{ wagonId: 2 }]);
		expect(query.findTrackedOrder).toHaveBeenCalledWith(12);
	});
	it("rejects position updates for unknown wagons", async () => {
		query.findWagonExists.mockResolvedValue(undefined);
		await expect(
			service.updateWagonPosition(2 as never, { latitude: 1, longitude: 2 }),
		).rejects.toThrow(new NotFoundException("Wagon 2 not found"));
		expect(query.createWagonTracking).not.toHaveBeenCalled();
	});
	it("persists wagon coordinates as strings with the default status", async () => {
		query.findWagonExists.mockResolvedValue({ id: 2 } as never);
		query.createWagonTracking.mockResolvedValue({ id: 8 } as never);
		await expect(
			service.updateWagonPosition(2 as never, {
				latitude: 1.5,
				longitude: -2.25,
			}),
		).resolves.toEqual({ id: 8 });
		expect(query.createWagonTracking).toHaveBeenCalledWith({
			wagonId: 2,
			latitude: "1.5",
			longitude: "-2.25",
			status: "IN_TRANSIT",
		});
	});
	it("preserves an explicitly supplied wagon status", async () => {
		query.findWagonExists.mockResolvedValue({ id: 2 } as never);
		query.createWagonTracking.mockResolvedValue({ id: 8 } as never);
		await service.updateWagonPosition(2 as never, {
			latitude: 1,
			longitude: 2,
			status: "ARRIVED",
		});
		expect(query.createWagonTracking).toHaveBeenCalledWith({
			wagonId: 2,
			latitude: "1",
			longitude: "2",
			status: "ARRIVED",
		});
	});
	it("rejects position updates for unknown trains", async () => {
		query.findTrainExists.mockResolvedValue(undefined);
		await expect(
			service.updateTrainPosition(4 as never, { latitude: 1, longitude: 2 }),
		).rejects.toThrow(new NotFoundException("Train 4 not found"));
		expect(query.updateTrainPosition).not.toHaveBeenCalled();
	});
	it("persists train coordinates and the default status", async () => {
		query.findTrainExists.mockResolvedValue({ id: 4 } as never);
		query.updateTrainPosition.mockResolvedValue({ id: 9 } as never);
		await expect(
			service.updateTrainPosition(4 as never, { latitude: 1, longitude: 2 }),
		).resolves.toEqual({ id: 9 });
		expect(query.updateTrainPosition).toHaveBeenCalledWith(4, {
			latitude: "1",
			longitude: "2",
			status: "IN_TRANSIT",
		});
	});
	it("preserves an explicitly supplied train status", async () => {
		query.findTrainExists.mockResolvedValue({ id: 4 } as never);
		query.updateTrainPosition.mockResolvedValue({ id: 9 } as never);
		await service.updateTrainPosition(4 as never, {
			latitude: 1,
			longitude: 2,
			status: "STOPPED",
		});
		expect(query.updateTrainPosition).toHaveBeenCalledWith(4, {
			latitude: "1",
			longitude: "2",
			status: "STOPPED",
		});
	});
});
