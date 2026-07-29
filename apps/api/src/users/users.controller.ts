import { Controller, Get, Param } from "@nestjs/common";
import { users } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import { UsersService } from "./users.service";

type User = InferSelectModel<typeof users>;

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	async findOneById(@Param("id") id: User["id"]) {
		return this.usersService.findOneById(id);
	}
}
