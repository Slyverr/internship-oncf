import { API_ERROR_CODES, ManagedReferenceResource } from "@ecommand/shared";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

describe("CatalogService managed reference data", () => {
	const catalogQuery = {
		findManagedReferenceData: jest.fn(),
		createManagedReferenceData: jest.fn(),
		updateManagedReferenceData: jest.fn(),
		hasActiveStation: jest.fn(),
		hasActivePort: jest.fn(),
		hasActivePortsForStation: jest.fn(),
		hasActiveBerthsForPort: jest.fn(),
		hasActiveLoadingLocationsForPort: jest.fn(),
	};
	const service = new CatalogService(catalogQuery as never, {} as never);

	beforeEach(() => jest.clearAllMocks());

	it("rejects station creation without a station code", async () => {
		await expect(
			service.createManagedReferenceData(ManagedReferenceResource.STATIONS, {
				name: "Central",
			}),
		).rejects.toMatchObject({
			response: {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				details: { fields: { stationCode: ["IS_NOT_EMPTY"] } },
			},
		});
		expect(catalogQuery.createManagedReferenceData).not.toHaveBeenCalled();
	});

	it("rejects a port whose selected station is inactive", async () => {
		catalogQuery.hasActiveStation.mockResolvedValue(false);
		await expect(
			service.createManagedReferenceData(ManagedReferenceResource.PORTS, {
				name: "Port 1",
				type: "normal",
				stationId: 7,
			}),
		).rejects.toBeInstanceOf(ConflictException);
		expect(catalogQuery.createManagedReferenceData).not.toHaveBeenCalled();
	});

	it("prevents archiving stations while active ports depend on them", async () => {
		catalogQuery.hasActivePortsForStation.mockResolvedValue(true);
		await expect(
			service.updateManagedReferenceData(ManagedReferenceResource.STATIONS, 7, {
				name: "Central",
				stationCode: "CTR",
				isActive: false,
			}),
		).rejects.toBeInstanceOf(ConflictException);
		expect(catalogQuery.updateManagedReferenceData).not.toHaveBeenCalled();
	});

	it("rejects a berth without a port", async () => {
		await expect(
			service.createManagedReferenceData(ManagedReferenceResource.BERTHS, {
				name: "Quay 1",
			}),
		).rejects.toBeInstanceOf(BadRequestException);
		expect(catalogQuery.createManagedReferenceData).not.toHaveBeenCalled();
	});
});
