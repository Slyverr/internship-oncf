import { Permission, Role } from "@ecommand/shared";
import { BadRequestException, NotFoundException } from "@nestjs/common";
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
			findUserForAuth: jest.fn(),
			createUser: jest.fn(),
			updateUser: jest.fn(),
			findUserExists: jest.fn(),
		} as unknown as jest.Mocked<UsersQuery>;
		mapper = {
			toCreate: jest.fn(),
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
		await expect(service.findOne(12)).rejects.toThrow(
			new NotFoundException("User with id 12 not found"),
		);
	});

	it("finds a user by email", async () => {
		query.findUserByEmail.mockResolvedValue(user as never);
		expect(await service.findOneByEmail(user.email)).toEqual(user);
		expect(query.findUserByEmail).toHaveBeenCalledWith(user.email);
	});

	it("reports a missing user by email", async () => {
		query.findUserByEmail.mockResolvedValue(undefined);
		await expect(service.findOneByEmail(user.email)).rejects.toThrow(
			new NotFoundException("User with email 'person@example.test' not found"),
		);
	});

	it("returns auth identity with effective permission names", async () => {
		query.findUserForAuth.mockResolvedValue({
			id: 12,
			email: user.email,
			password: "hash",
			isActive: true,
			customerId: null,
			agencyId: null,
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
			customerId: null,
			agencyId: null,
			role: Role.ADMIN,
			permissions: [Permission.USERS_READ],
		});
	});

	it("rejects auth lookup when the user is missing", async () => {
		query.findUserForAuth.mockResolvedValue(undefined);
		await expect(service.findOneForAuth(12)).rejects.toThrow(
			new NotFoundException("User with id 12 not found"),
		);
	});

	it("rejects auth lookup when the user's role is missing", async () => {
		query.findUserForAuth.mockResolvedValue({ id: 12, role: null } as never);
		await expect(service.findOneForAuth(12)).rejects.toThrow(
			new NotFoundException("Role not found for user 12"),
		);
	});

	it("maps and creates a user, then returns the created record", async () => {
		const values = { email: user.email, password: "hashed" };
		mapper.toCreate.mockResolvedValue(values as never);
		query.createUser.mockResolvedValue({ id: 12 } as never);
		query.findUser.mockResolvedValue(user as never);

		expect(
			await service.create({ email: user.email } as never, authUser),
		).toEqual(user);
		expect(mapper.toCreate).toHaveBeenCalledWith(
			{ email: user.email },
			authUser,
		);
		expect(query.createUser).toHaveBeenCalledWith(values);
		expect(query.findUser).toHaveBeenCalledWith(12);
	});

	it("requires a customer when creating a client representative", async () => {
		await expect(
			service.create(
				{ email: user.email, role: Role.CLIENT_REPRESENTATIVE } as never,
				authUser,
			),
		).rejects.toThrow(
			new BadRequestException(
				"A customer must be assigned to client representatives",
			),
		);
		expect(mapper.toCreate).not.toHaveBeenCalled();
	});

	it("maps updates and returns the updated user", async () => {
		const values = { firstName: "Updated" };
		mapper.toUpdate.mockResolvedValue(values as never);
		query.updateUser.mockResolvedValue({ id: 12 } as never);
		query.findUser.mockResolvedValue({
			...user,
			firstName: "Updated",
		} as never);

		expect(
			await service.update(12, { firstName: "Updated" } as never, authUser),
		).toEqual({ ...user, firstName: "Updated" });
		expect(mapper.toUpdate).toHaveBeenCalledWith(
			{ firstName: "Updated" },
			authUser,
		);
		expect(query.updateUser).toHaveBeenCalledWith(12, values);
	});

	it("requires a customer when changing a user to client representative", async () => {
		query.findUser.mockResolvedValue(user as never);
		await expect(
			service.update(
				12,
				{ role: Role.CLIENT_REPRESENTATIVE } as never,
				authUser,
			),
		).rejects.toThrow(
			new BadRequestException(
				"A customer must be assigned to client representatives",
			),
		);
		expect(mapper.toUpdate).not.toHaveBeenCalled();
	});

	it("deactivates a user", async () => {
		query.updateUser.mockResolvedValue({ ...user, isActive: false } as never);
		expect(await service.deactivate(12)).toEqual({ ...user, isActive: false });
		expect(query.updateUser).toHaveBeenCalledWith(12, { isActive: false });
	});

	it("reports a missing user during deactivation", async () => {
		query.updateUser.mockResolvedValue(undefined as never);
		await expect(service.deactivate(12)).rejects.toThrow(
			new NotFoundException("User with id 12 not found"),
		);
	});

	it("delegates existence checks", async () => {
		query.findUserExists.mockResolvedValue(true);
		expect(await service.exists(12)).toBe(true);
		expect(query.findUserExists).toHaveBeenCalledWith(12);
	});
});
