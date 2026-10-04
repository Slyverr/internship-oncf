import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	Permission,
	RegistrationStatus,
	Role,
	RolePersona,
} from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { UsersMapper } from "./users.mapper";
import { UsersQuery } from "./users.query";
import { UsersService } from "./users.service";

const authUser: AuthUser = {
	id: 5,
	email: "admin@example.test",
	role: Role.ADMIN,
	permissions: new Set([Permission.USERS_CREATE]),
	sessionId: "session-1",
	customerId: null,
	agencyId: null,
};

const user = { id: 12, email: "person@example.test", firstName: "Alex" };

describe("UsersService", () => {
	let service: UsersService;
	let query: jest.Mocked<UsersQuery>;
	let mapper: jest.Mocked<UsersMapper>;

	beforeEach(() => {
		query = {
			findUsers: jest.fn(),
			findUser: jest.fn(),
			findUserByEmail: jest.fn(),
			findUserByLoginIdentifier: jest.fn(),
			findUserEmailExists: jest.fn(),
			findUserForAuth: jest.fn(),
			findAssignableRole: jest.fn(),
			createUser: jest.fn(),
			updateUserAndAssignments: jest.fn(),
			deactivateUser: jest.fn(),

			reviewRegistration: jest.fn(),
			findUserExists: jest.fn(),
		} as unknown as jest.Mocked<UsersQuery>;
		mapper = {
			toCreate: jest.fn(),
			toRegistration: jest.fn(),
			toUpdate: jest.fn(),
		} as unknown as jest.Mocked<UsersMapper>;
		service = new UsersService(query, mapper);
	});

	it("lists users through the query layer", async () => {
		query.findUsers.mockResolvedValue([user] as never);
		expect(await service.findAll()).toEqual([user]);
		expect(query.findUsers).toHaveBeenCalledTimes(1);
	});

	it("returns a user by id", async () => {
		query.findUser.mockResolvedValue(user as never);
		expect(await service.findOne(12)).toEqual(user);
		expect(query.findUser).toHaveBeenCalledWith(12);
	});

	it("reports a missing user by id", async () => {
		query.findUser.mockResolvedValue(undefined);
		await expect(service.findOne(12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_NOT_FOUND },
		});
	});

	it("finds a user by email", async () => {
		query.findUserByEmail.mockResolvedValue(user as never);
		expect(await service.findOneByEmail(user.email)).toEqual(user);
		expect(query.findUserByEmail).toHaveBeenCalledWith(user.email);
	});

	it("reports a missing user by email", async () => {
		query.findUserByEmail.mockResolvedValue(undefined);
		await expect(service.findOneByEmail(user.email)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_NOT_FOUND },
		});
	});

	it("returns a matching email or employee code", async () => {
		query.findUserByLoginIdentifier.mockResolvedValue(user as never);
		await expect(service.findOneByLoginIdentifier("EMP-12")).resolves.toEqual(
			user,
		);
		expect(query.findUserByLoginIdentifier).toHaveBeenCalledWith("EMP-12");
	});

	it("returns undefined for a missing login identifier", async () => {
		query.findUserByLoginIdentifier.mockResolvedValue(undefined);
		await expect(service.findOneByLoginIdentifier("missing")).resolves.toBe(
			undefined,
		);
	});

	it("returns auth identity with effective permission names", async () => {
		query.findUserForAuth.mockResolvedValue({
			id: 12,
			email: user.email,
			password: "hash",
			isActive: true,
			registrationStatus: RegistrationStatus.APPROVED,
			customerId: null,
			agencyId: null,
			userCustomers: [],
			role: {
				name: Role.ADMIN,
				rolePermissions: [
					{ permission: { name: Permission.USERS_READ } },
					{ permission: undefined },
				],
			},
		} as never);

		expect(await service.findOneForAuth(12)).toEqual({
			id: 12,
			email: user.email,
			password: "hash",
			isActive: true,
			registrationStatus: RegistrationStatus.APPROVED,
			customerId: null,
			agencyId: null,
			assignedCustomerIds: [],
			role: Role.ADMIN,
			permissions: [Permission.USERS_READ],
		});
	});

	it("rejects auth lookup when the user is missing", async () => {
		query.findUserForAuth.mockResolvedValue(undefined);
		await expect(service.findOneForAuth(12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_NOT_FOUND },
		});
	});

	it("rejects auth lookup when the user's role is missing", async () => {
		query.findUserForAuth.mockResolvedValue({ id: 12, role: null } as never);
		await expect(service.findOneForAuth(12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_ROLE_NOT_FOUND },
		});
	});

	it("maps and creates a user, then returns the created record", async () => {
		const values = { email: user.email, password: "hashed" };
		query.findAssignableRole.mockResolvedValue({
			id: "role-id",
			persona: RolePersona.AGENT_COMMERCIAL,
		} as never);
		mapper.toCreate.mockResolvedValue(values as never);
		query.createUser.mockResolvedValue({ id: 12 } as never);
		query.findUser.mockResolvedValue(user as never);

		expect(
			await service.create(
				{ email: user.email, roleId: "role-id" } as never,
				authUser,
			),
		).toEqual(user);
		expect(mapper.toCreate).toHaveBeenCalledWith(
			{ email: user.email, roleId: "role-id" },
			authUser,
			"role-id",
		);
		expect(query.createUser).toHaveBeenCalledWith(
			{ ...values, type: "internal" },
			[],
		);
		expect(query.findUser).toHaveBeenCalledWith(12);
	});

	it("derives account type from the assigned persona", async () => {
		query.findAssignableRole.mockResolvedValue({
			id: "client-role-id",
			persona: RolePersona.CLIENT_REPRESENTATIVE,
		} as never);
		mapper.toCreate.mockResolvedValue({ email: user.email } as never);
		query.createUser.mockResolvedValue({ id: 12 } as never);
		query.findUser.mockResolvedValue(user as never);

		await service.create(
			{
				email: user.email,
				roleId: "client-role-id",
				customerId: 7,
				type: "internal",
			} as never,
			authUser,
		);

		expect(query.createUser).toHaveBeenCalledWith(
			expect.objectContaining({ type: "external" }),
			undefined,
		);
	});

	it("requires a customer when creating a client representative", async () => {
		query.findAssignableRole.mockResolvedValue({
			id: "client-role-id",
			persona: RolePersona.CLIENT_REPRESENTATIVE,
		} as never);
		await expect(
			service.create(
				{ email: user.email, role: Role.CLIENT_REPRESENTATIVE } as never,
				authUser,
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CUSTOMER_ASSIGNMENT_REQUIRED },
		});
		expect(mapper.toCreate).not.toHaveBeenCalled();
	});

	it("creates a pending external client account using a normalized email", async () => {
		query.findUserEmailExists.mockResolvedValue(false);
		mapper.toRegistration.mockResolvedValue({
			email: "client@example.test",
			registrationStatus: RegistrationStatus.PENDING,
			isActive: false,
		} as never);
		query.createUser.mockResolvedValue({ id: 24 } as never);

		await expect(
			service.registerClient({
				email: " Client@Example.Test ",
				password: "StrongPass1!",
				firstName: " Sam ",
				lastName: " Example ",
				customerId: 9,
			}),
		).resolves.toEqual({
			code: API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW,
		});
		expect(query.findUserEmailExists).toHaveBeenCalledWith(
			"client@example.test",
		);
		expect(mapper.toRegistration).toHaveBeenCalledWith({
			email: "client@example.test",
			password: "StrongPass1!",
			firstName: "Sam",
			lastName: "Example",
			customerId: 9,
		});
		expect(query.createUser).toHaveBeenCalledWith(
			expect.objectContaining({
				registrationStatus: RegistrationStatus.PENDING,
				isActive: false,
			}),
		);
	});

	it("rejects an email that is already registered", async () => {
		query.findUserEmailExists.mockResolvedValue(true);
		await expect(
			service.registerClient({
				email: "client@example.test",
				password: "StrongPass1!",
				firstName: "Sam",
				lastName: "Example",
				customerId: 9,
			}),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_EMAIL_ALREADY_EXISTS },
		});
		expect(mapper.toRegistration).not.toHaveBeenCalled();
		expect(query.createUser).not.toHaveBeenCalled();
	});

	it.each([
		[RegistrationStatus.APPROVED, Role.CLIENT_REPRESENTATIVE],
		[RegistrationStatus.PENDING, Role.AGENT_COMMERCIAL],
	])(
		"rejects review when the account is not a pending client representative",
		async (registrationStatus, roleName) => {
			query.findAssignableRole.mockResolvedValue({
				id: "role-id",
				persona:
					roleName === Role.CLIENT_REPRESENTATIVE
						? RolePersona.CLIENT_REPRESENTATIVE
						: RolePersona.AGENT_COMMERCIAL,
			} as never);
			query.findUser.mockResolvedValue({
				id: 24,
				registrationStatus,
				roleId: "role-id",
				role: { name: roleName },
			} as never);
			await expect(
				service.reviewRegistration(24, RegistrationStatus.APPROVED),
			).rejects.toMatchObject({
				response: { code: API_ERROR_CODES.ACCOUNT_REGISTRATION_NOT_PENDING },
			});
			expect(query.reviewRegistration).not.toHaveBeenCalled();
		},
	);

	it.each([
		[RegistrationStatus.APPROVED, true],
		[RegistrationStatus.REJECTED, false],
	] as const)("reviews a pending client as %s", async (status, isActive) => {
		const pending = {
			id: 24,
			registrationStatus: RegistrationStatus.PENDING,
			roleId: "client-role-id",
			role: { name: Role.CLIENT_REPRESENTATIVE },
		};
		const reviewed = {
			...pending,
			registrationStatus: status,
			isActive,
		};
		query.findAssignableRole.mockResolvedValue({
			id: "client-role-id",
			persona: RolePersona.CLIENT_REPRESENTATIVE,
		} as never);
		query.findUser.mockResolvedValueOnce(pending as never);
		query.reviewRegistration.mockResolvedValue({ id: 24 } as never);
		query.findUser.mockResolvedValueOnce(reviewed as never);

		await expect(service.reviewRegistration(24, status)).resolves.toEqual(
			reviewed,
		);
		expect(query.reviewRegistration).toHaveBeenCalledWith(
			24,
			"client-role-id",
			status,
		);
	});

	it("maps updates and returns the updated user", async () => {
		const values = { firstName: "Updated", type: "internal" };
		mapper.toUpdate.mockResolvedValue(values as never);
		query.updateUserAndAssignments.mockResolvedValue({ id: 12 } as never);
		query.findUser.mockResolvedValue({
			...user,
			roleId: "agent-role-id",
			firstName: "Updated",
		} as never);
		query.findAssignableRole.mockResolvedValue({
			id: "agent-role-id",
			persona: RolePersona.AGENT_COMMERCIAL,
		} as never);

		expect(
			await service.update(12, { firstName: "Updated" } as never, authUser),
		).toEqual({ ...user, roleId: "agent-role-id", firstName: "Updated" });
		expect(mapper.toUpdate).toHaveBeenCalledWith(
			{ firstName: "Updated" },
			authUser,
			undefined,
		);
		expect(query.updateUserAndAssignments).toHaveBeenCalledWith(
			12,
			{ firstName: "Updated", type: "internal" },
			undefined,
		);
	});

	it("requires a customer when changing a user to client representative", async () => {
		query.findUser.mockResolvedValue({
			...user,
			roleId: "agent-role-id",
		} as never);
		query.findAssignableRole.mockResolvedValue({
			id: "client-role-id",
			persona: RolePersona.CLIENT_REPRESENTATIVE,
		} as never);
		await expect(
			service.update(
				12,
				{ role: Role.CLIENT_REPRESENTATIVE } as never,
				authUser,
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CUSTOMER_ASSIGNMENT_REQUIRED },
		});
		expect(mapper.toUpdate).not.toHaveBeenCalled();
	});

	it("deactivates a user", async () => {
		query.deactivateUser.mockResolvedValue({ id: 12 } as never);
		expect(await service.deactivate(12)).toEqual({ id: 12 });
		expect(query.deactivateUser).toHaveBeenCalledWith(12);
	});

	it("prevents deactivating the last active administrator", async () => {
		query.deactivateUser.mockResolvedValue("LAST_ACTIVE_ADMIN" as never);

		await expect(service.deactivate(12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.LAST_ACTIVE_ADMIN },
		});
	});

	it("reports a missing user during deactivation", async () => {
		query.deactivateUser.mockResolvedValue(undefined as never);
		await expect(service.deactivate(12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.USER_NOT_FOUND },
		});
	});

	it("delegates existence checks", async () => {
		query.findUserExists.mockResolvedValue(true);
		expect(await service.exists(12)).toBe(true);
		expect(query.findUserExists).toHaveBeenCalledWith(12);
	});
});
