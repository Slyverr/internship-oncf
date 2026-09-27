import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterClientDto } from "./register-client.dto";

const validRegistration = {
	email: " Client@Example.Test ",
	password: "StrongPass1!",
	firstName: " Sam ",
	lastName: " Example ",
	customerCode: " CLI009 ",
	ice: "123456789012345",
};

describe("RegisterClientDto", () => {
	it("normalizes email and trims identity fields", async () => {
		const dto = plainToInstance(RegisterClientDto, validRegistration);
		await expect(validate(dto)).resolves.toHaveLength(0);
		expect(dto).toMatchObject({
			email: "client@example.test",
			firstName: "Sam",
			lastName: "Example",
			customerCode: "CLI009",
		});
	});

	it.each([
		{ ice: "12345678901234" },
		{ ice: "12345678901234A" },
		{ password: "weakpass" },
		{ email: "invalid" },
	])("rejects invalid registration data: %o", async (overrides) => {
		const dto = plainToInstance(RegisterClientDto, {
			...validRegistration,
			...overrides,
		});
		await expect(validate(dto)).resolves.not.toHaveLength(0);
	});
});
