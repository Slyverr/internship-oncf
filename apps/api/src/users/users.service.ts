import { Injectable } from "@nestjs/common";
import { users } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";

type User = InferSelectModel<typeof users>;

@Injectable()
export class UsersService {
	constructor(private drizzle: DrizzleService) {}

	findAll() {
		return this.drizzle.db.query.users.findMany();
	}

	async findOneById(id: User["id"]) {
		return this.drizzle.db.query.users.findFirst({
			where: {
				id,
			},
		});
	}

	async findOneByEmail(email: User["email"]) {
		return this.drizzle.db.query.users.findFirst({
			where: {
				email,
			},
		});
	}
}
