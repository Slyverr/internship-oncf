import { BadRequestException } from "@nestjs/common";
import { FileIdPipe } from "@/orders/files/pipes/file-id.pipe";
import { OrderIdPipe } from "@/orders/pipes/order-id.pipe";
import { parsePositiveInteger } from "./parse-positive-integer";

describe("parsePositiveInteger", () => {
	it.each(["1", "42", "0007"])("parses positive integer ids: %s", (value) => {
		expect(parsePositiveInteger(value, "file")).toBe(Number(value));
	});

	it.each(["", "0", "-1", "1abc", "1.5", "1e2", "9007199254740992"])(
		"rejects malformed or unsafe id input: %s",
		(value) => {
			expect(() => parsePositiveInteger(value, "file")).toThrow(
				new BadRequestException("Invalid file ID"),
			);
		},
	);

	it("keeps the resource label in both route pipes", () => {
		expect(() => new OrderIdPipe().transform("bad")).toThrow(
			new BadRequestException("Invalid order ID"),
		);
		expect(() => new FileIdPipe().transform("bad")).toThrow(
			new BadRequestException("Invalid file ID"),
		);
	});
});
