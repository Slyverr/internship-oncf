import { BadRequestException } from "@nestjs/common";
import { ClaimIdPipe } from "@/claims/pipes/claim-id.pipe";
import { CustomerIdPipe } from "@/customers/pipes/customer-id.pipe";
import { NotificationIdPipe } from "@/notifications/pipes/notification-id.pipe";
import { ProgramIdPipe } from "@/programs/pipes/program-id.pipe";
import { UserIdPipe } from "@/users/pipes/user-id.pipe";

const cases = [
	["claim", new ClaimIdPipe()],
	["customer", new CustomerIdPipe()],
	["notification", new NotificationIdPipe()],
	["program", new ProgramIdPipe()],
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
