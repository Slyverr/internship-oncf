import { Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "src/db/drizzle.service";
import { UserEmail, UserId } from "./users.types";

@Injectable()
export class UsersService {
	constructor(private drizzle: DrizzleService) {}

	findAll() {
		return this.drizzle.db.query.users.findMany();
	}

	async findOneById(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: {
				id,
			},
		});

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		return user;
	}

	async findOneByEmail(email: UserEmail) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: {
				email,
			},
		});

		if (!user) {
			throw new NotFoundException(`User with email '${email}' not found`);
		}

		return user;
	}

	async findUserWithPermissions(id: number) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: { id: true, email: true },
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
}
