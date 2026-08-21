import { Injectable, NotFoundException } from "@nestjs/common";
import { users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { toCreate, toUpdate } from "./users.mapper";
import { userDetailColumns, userListColumns } from "./users.query";
import { UserEmail, UserId } from "./users.types";

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

	async findUserWithPermissions(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: {
				id: true,
				email: true,
			},
			with: {
				role: {
					columns: { name: true },
					with: {
						rolePermissions: {
							columns: {},
							with: {
								permission: {
									columns: { name: true },
								},
							},
						},
					},
				},
			},
		});

		if (!user) return null;

		return {
			id: user.id,
			email: user.email,
			role: user.role?.name,
			permissions: user.role?.rolePermissions.flatMap(
				(rp) => rp.permission?.name ?? [],
			),
		};
	}

	async exists(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: { id: true },
		});

		return !!user;
	}

	private async persistUpdate(
		id: UserId,
		values: Partial<typeof users.$inferInsert>,
	) {
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
