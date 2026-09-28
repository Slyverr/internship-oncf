import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { LoginDto } from "./login.dto";

describe("LoginDto", () => {
	it.each(["person@example.test", "EMP-12"])(
		"accepts email and employee-ID identifiers: %s",
		async (username) => {
			const dto = plainToInstance(LoginDto, {
				username,
				password: "password123",
			});
			expect(await validate(dto)).toHaveLength(0);
		},
	);

	it("rejects a blank identifier, oversized identifier, or short password", async () => {
		for (const values of [
			{ username: " ", password: "password123" },
			{ username: "x".repeat(101), password: "password123" },
			{ username: "EMP-12", password: "short" },
		]) {
			const dto = plainToInstance(LoginDto, values);
			expect(await validate(dto)).not.toHaveLength(0);
		}
	});
});
