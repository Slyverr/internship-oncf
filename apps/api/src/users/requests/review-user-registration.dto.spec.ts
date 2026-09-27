import { RegistrationStatus } from "@ecommand/shared";
import { validate } from "class-validator";
import { ReviewUserRegistrationDto } from "./review-user-registration.dto";

describe("ReviewUserRegistrationDto", () => {
	it.each([RegistrationStatus.APPROVED, RegistrationStatus.REJECTED])(
		"accepts %s",
		async (status) => {
			const dto = Object.assign(new ReviewUserRegistrationDto(), { status });
			await expect(validate(dto)).resolves.toHaveLength(0);
		},
	);

	it("does not allow setting an account back to pending", async () => {
		const dto = Object.assign(new ReviewUserRegistrationDto(), {
			status: RegistrationStatus.PENDING,
		});
		await expect(validate(dto)).resolves.not.toHaveLength(0);
	});
});
