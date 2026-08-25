import { Permission, Role } from "@ecommand/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import { users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { DrizzleService } from "src/database/drizzle.service";
import { withDbErrorHandling } from "src/database/drizzle.util";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { toCreate, toUpdate } from "./users.mapper";
import {
	userAuthColumns,
	userAuthRelations,
	userDetailColumns,
	userListColumns,
} from "./users.query";
import { UserEmail, UserId, UserUpdate } from "./users.types";

@Injectable()
export class UsersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll() {
		return this.drizzle.db.query.users.findMany({
			columns: userListColumns,
		});
	}

	async findOne(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: userDetailColumns,
		});

		return this.ensure(user, id);
	}

	async findOneByEmail(email: UserEmail) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { email },
		});

		if (!user) {
			throw new NotFoundException(`User with email '${email}' not found`);
		}

		return user;
	}

	async findOneForAuth(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: userAuthColumns,
			with: userAuthRelations,
		});

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

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
		const values = await toCreate(dto, user);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(users)
					.values(values)
					.returning({ id: users.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async update(id: UserId, dto: UpdateUserDto, user: AuthUser) {
		const values = toUpdate(dto, user);

		await this.persistUpdate(id, values);

		return this.findOne(id);
	}

	async deactivate(id: UserId) {
		const user = await this.persistUpdate(id, {
			isActive: false,
		});

		return {
			id: user.id,
		};
	}

	async exists(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: { id: true },
		});

		return !!user;
	}

	private async persistUpdate(id: UserId, values: UserUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(users)
					.set(values)
					.where(eq(users.id, id))
					.returning({ id: users.id }),
			values,
		);

		return this.ensure(updated, id);
	}

	private ensure<T>(user: T | undefined, id: UserId): T {
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		return user;
	}
}
