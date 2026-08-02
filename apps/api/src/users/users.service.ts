import { Injectable } from "@nestjs/common";
import { DrizzleService } from "src/db/drizzle.service";
import { UserEmail, UserId } from "./users.types";

@Injectable()
export class UsersService {
	constructor(private drizzle: DrizzleService) {}

	findAll() {
		return this.drizzle.db.query.users.findMany();
	}

	async findOneById(id: UserId) {
		return this.drizzle.db.query.users.findFirst({
			where: {
				id,
			},
		});
	}

	async findOneByEmail(email: UserEmail) {
		return this.drizzle.db.query.users.findFirst({
			where: {
				email,
			},
		});
	}
}
