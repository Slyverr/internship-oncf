import { Permission, Role } from "@ecommand/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { UsersMapper } from "./users.mapper";
import { UsersQuery } from "./users.query";
import type { UserEmail, UserId } from "./users.types";

@Injectable()
export class UsersService {
	constructor(
		private readonly usersQuery: UsersQuery,
		private readonly usersMapper: UsersMapper,
	) {}

	async findAll() {
		return this.usersQuery.findUsers();
	}

	async findOne(id: UserId) {
		return this.ensure(await this.usersQuery.findUser(id), id);
	}

	async findOneByEmail(email: UserEmail) {
		const user = await this.usersQuery.findUserByEmail(email);
		if (!user) {
			throw new NotFoundException(`User with email '${email}' not found`);
		}
		return user;
	}

	async findOneForAuth(id: UserId) {
		const user = this.ensure(await this.usersQuery.findUserForAuth(id), id);
		if (!user.role) {
			throw new NotFoundException(`Role not found for user ${id}`);
		}
		return {
			id: user.id,
			email: user.email,
			password: user.password,
			isActive: user.isActive,
			customerId: user.customerId,
			agencyId: user.agencyId,
			role: user.role.name as Role,
			permissions: user.role.rolePermissions
				.map((rp) => rp.permission?.name)
				.filter((name): name is Permission => name !== undefined),
		};
	}

	async create(dto: CreateUserDto, user: AuthUser) {
		const values = await this.usersMapper.toCreate(dto, user);
		const created = await this.usersQuery.createUser(values);
		return this.findOne(created.id);
	}

	async update(id: UserId, dto: UpdateUserDto, user: AuthUser) {
		const values = await this.usersMapper.toUpdate(dto, user);
		await this.usersQuery.updateUser(id, values);
		return this.findOne(id);
	}

	async deactivate(id: UserId) {
		const user = await this.usersQuery.updateUser(id, { isActive: false });
		return this.ensure(user, id);
	}

	async exists(id: UserId) {
		return this.usersQuery.findUserExists(id);
	}

	private ensure<T>(user: T | undefined, id: UserId): T {
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
		return user;
	}
}
