import { BadRequestException } from "@nestjs/common";
import { ClaimNumberPipe } from "@/claims/pipes/claim-number.pipe";
import { CustomerIdPipe } from "@/customers/pipes/customer-id.pipe";
import { NotificationIdPipe } from "@/notifications/pipes/notification-id.pipe";
import { OrderNumberPipe } from "@/orders/pipes/order-number.pipe";
import { ProgramNumberPipe } from "@/programs/pipes/program-number.pipe";
import { UserIdPipe } from "@/users/pipes/user-id.pipe";

const cases = [
	["customer", new CustomerIdPipe()],
	["notification", new NotificationIdPipe()],
	["user", new UserIdPipe()],
] as const;

describe.each(cases)("%s route ID", (label, pipe) => {
	it("accepts a valid positive integer", () => {
		expect(pipe.transform("42")).toBe(42);
	});
	it.each(["", "0", "-1", "1abc", "1.5", "9007199254740992"])(
		"rejects malformed ID %s",
		(value) => {
			expect(() => pipe.transform(value)).toThrow(
				new BadRequestException(`Invalid ${label} ID`),
			);
		},
	);
});

describe("claim public-code route parameter", () => {
	const pipe = new ClaimNumberPipe();
	const code = "CLM-ABCDEFGHJK";

	it("accepts a ten-character claim code", () => {
		expect(pipe.transform(code)).toBe(code);
	});

	it.each(["1", "CLM-000000001", "ORD-ABCDEFGHJK", "CLM-short"])(
		"rejects malformed claim code %s",
		(value) => {
			expect(() => pipe.transform(value)).toThrow(
				new BadRequestException("Invalid claim number"),
			);
		},
	);
});

describe.each([
	["order", new OrderNumberPipe(), "ORD-ABCDEFGHIJ"],
	["program", new ProgramNumberPipe(), "PRG-ABCDEFGHIJ"],
])("%s public-code route parameter", (label, pipe, code) => {
	it("accepts a ten-character public code", () => {
		expect(pipe.transform(code)).toBe(code);
	});
	it.each(["1", "CLM-ABCDEFGHJK", `${label.toUpperCase()}-short`])(
		"rejects malformed public code %s",
		(value) => {
			expect(() => pipe.transform(value)).toThrow(
				new BadRequestException(`Invalid ${label} number`),
			);
		},
	);
});
