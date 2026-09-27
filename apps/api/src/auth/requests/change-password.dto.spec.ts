import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ChangePasswordDto } from "./change-password.dto";

describe("ChangePasswordDto", () => {
	const validate = (values: Record<string, unknown>) =>
		validateSync(plainToInstance(ChangePasswordDto, values));

	it("accepts a strong password and current password", () => {
		expect(
			validate({ currentPassword: "old", newPassword: "SecurePass1!" }),
		).toHaveLength(0);
	});

	it.each(["short", "lowercase1!", "UPPERCASE1!", "NoNumber!!", "NoSymbol123"])(
		"rejects a password that does not meet reset password strength rules",
		(newPassword) => {
			expect(validate({ currentPassword: "old", newPassword })).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "newPassword" }),
				]),
			);
		},
	);

	it("requires a string current password", () => {
		expect(
			validate({ currentPassword: 123, newPassword: "SecurePass1!" }),
		).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ property: "currentPassword" }),
			]),
		);
	});
});
