import { BadRequestException } from "@nestjs/common";
import { TrainIdPipe } from "./train-id.pipe";
import { WagonIdPipe } from "./wagon-id.pipe";

describe.each([
	["train", new TrainIdPipe()],
	["wagon", new WagonIdPipe()],
] as const)("%s ID pipe", (_name, pipe) => {
	it("accepts positive integer IDs", () => {
		expect(pipe.transform("42")).toBe(42);
	});
	it.each(["", "0", "-1", "1abc", "1.5", "9007199254740992"])(
		"rejects invalid ID %s",
		(value) => {
			expect(() => pipe.transform(value)).toThrow(
				new BadRequestException({ code: "INVALID_IDENTIFIER" }),
			);
		},
	);
});
