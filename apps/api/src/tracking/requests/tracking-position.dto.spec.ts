import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UpdateTrainPositionDto } from "./update-train-position.dto";
import { UpdateWagonPositionDto } from "./update-wagon-position.dto";

describe.each([
	["train", UpdateTrainPositionDto],
	["wagon", UpdateWagonPositionDto],
] as const)("%s tracking position", (_name, Dto) => {
	const validate = (latitude: number, longitude: number) =>
		validateSync(plainToInstance(Dto, { latitude, longitude }));

	it("accepts coordinate boundary values", () => {
		expect(validate(-90, -180)).toHaveLength(0);
		expect(validate(90, 180)).toHaveLength(0);
	});
	it.each([
		[90.01, 0],
		[-90.01, 0],
		[0, 180.01],
		[0, -180.01],
		[Number.NaN, 0],
	])("rejects out-of-range coordinates %p", (latitude, longitude) => {
		expect(validate(latitude, longitude).length).toBeGreaterThan(0);
	});
});
