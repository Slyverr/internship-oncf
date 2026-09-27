import { RegistrationStatus, Role } from "@ecommand/shared";
import bcrypt from "bcryptjs";
import { ROLES } from "@/database/reference-data";
import { UsersMapper } from "./users.mapper";

describe("UsersMapper registration", () => {
	it("creates a disabled pending external client account", async () => {
		const mapper = new UsersMapper();
		const input = {
			email: "client@example.test",
			password: "StrongPass1!",
			firstName: "Sam",
			lastName: "Example",
			customerId: 19,
		};

		const values = await mapper.toRegistration(input);
		await expect(bcrypt.compare(input.password, values.password)).resolves.toBe(
			true,
		);
		expect(values).toMatchObject({
			email: input.email,
			firstName: input.firstName,
			lastName: input.lastName,
			customerId: input.customerId,
			roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
			type: "external",
			registrationStatus: RegistrationStatus.PENDING,
			isActive: false,
		});
	});
});
