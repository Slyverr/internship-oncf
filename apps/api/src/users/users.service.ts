import { Injectable } from "@nestjs/common";
import { DrizzleService } from "src/db/drizzle.service";

@Injectable()
export class UsersService {
	constructor(private drizzle: DrizzleService) {}

	findAll() {
		return this.drizzle.db.query.users.findMany();
	}
}
