import { Permission, Role } from "@ecommand/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { DrizzleService } from "@/database/drizzle.service";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { toCreate, toUpdate } from "./users.mapper";
import {
	createUser,
	findUser,
	findUserByEmail,
	findUserExists,
	findUserForAuth,
	findUsers,
	updateUser,
} from "./users.query";
import type { UserEmail, UserId } from "./users.types";

@Injectable()
export class UsersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll() {
		return findUsers(this.drizzle.db);
	}

	async findOne(id: UserId) {
		return this.ensure(await findUser(this.drizzle.db, id), id);
	}

	async findOneByEmail(email: UserEmail) {
		const user = await findUserByEmail(this.drizzle.db, email);
		if (!user) {
			throw new NotFoundException(`User with email '${email}' not found`);
		}

		return user;
	}

	async findOneForAuth(id: UserId) {
		const user = this.ensure(await findUserForAuth(this.drizzle.db, id), id);
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
		const created = await createUser(
			this.drizzle.db,
			await toCreate(dto, user),
		);

		return this.findOne(created.id);
	}

	async update(id: UserId, dto: UpdateUserDto, user: AuthUser) {
		await updateUser(this.drizzle.db, id, toUpdate(dto, user));
		return this.findOne(id);
	}

	async deactivate(id: UserId) {
		const user = await updateUser(this.drizzle.db, id, { isActive: false });
		return this.ensure(user, id);
	}

	async exists(id: UserId) {
		return findUserExists(this.drizzle.db, id);
	}

	private ensure<T>(user: T | undefined, id: UserId): T {
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		return user;
	}
}
