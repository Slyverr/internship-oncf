import { validate } from "class-validator";
import { CreateCustomerDto } from "./create-customer.dto";

describe("CreateCustomerDto ICE validation", () => {
	it("accepts a 15-digit ICE and allows existing customer records without one", async () => {
		const withIce = Object.assign(new CreateCustomerDto(), {
			companyName: "Example Ltd",
			ice: "123456789012345",
		});
		const withoutIce = Object.assign(new CreateCustomerDto(), {
			companyName: "Legacy Example Ltd",
		});

		await expect(validate(withIce)).resolves.toHaveLength(0);
		await expect(validate(withoutIce)).resolves.toHaveLength(0);
	});

	it.each(["12345678901234", "1234567890123456", "12345678901234A"])(
		"rejects ICE %s",
		async (ice) => {
			const dto = Object.assign(new CreateCustomerDto(), {
				companyName: "Example Ltd",
				ice,
			});
			await expect(validate(dto)).resolves.toHaveLength(1);
		},
	);
});
