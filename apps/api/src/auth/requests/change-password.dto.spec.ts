import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ChangePasswordDto } from "./change-password.dto";
import { ResetPasswordDto } from "./reset-password.dto";

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

	it.each(["short", "lowercase1!", "UPPERCASE1!", "NoNumber!!", "NoSymbol123"])(
		"applies the shared strength policy to reset passwords",
		(newPassword) => {
			const errors = validate({ token: "reset-token", newPassword });
			expect(errors).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ property: "newPassword" }),
				]),
			);
		},
	);

	it("accepts the same strong password for account changes and password reset", () => {
		const changed = validate({
			currentPassword: "old",
			newPassword: "SecurePass1!",
		});
		const reset = validateSync(
			plainToInstance(ResetPasswordDto, {
				token: "reset-token",
				newPassword: "SecurePass1!",
			}),
		);
		expect(changed).toHaveLength(0);
		expect(reset).toHaveLength(0);
	});

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
