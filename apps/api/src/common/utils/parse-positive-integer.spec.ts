import { API_ERROR_CODES } from "@ecommand/shared";
import { BadRequestException } from "@nestjs/common";
import { FileIdPipe } from "@/orders/files/pipes/file-id.pipe";
import { parsePositiveInteger } from "./parse-positive-integer";

describe("parsePositiveInteger", () => {
	it.each(["1", "42", "0007"])("parses positive integer ids: %s", (value) => {
		expect(parsePositiveInteger(value)).toBe(Number(value));
	});

	it.each(["", "0", "-1", "1abc", "1.5", "1e2", "9007199254740992"])(
		"rejects malformed or unsafe id input: %s",
		(value) => {
			expect(() => parsePositiveInteger(value)).toThrow(
				new BadRequestException({ code: API_ERROR_CODES.INVALID_IDENTIFIER }),
			);
		},
	);

	it("keeps the resource label in the file route pipe", () => {
		expect(() => new FileIdPipe().transform("bad")).toThrow(
			new BadRequestException({ code: API_ERROR_CODES.INVALID_IDENTIFIER }),
		);
	});
});
