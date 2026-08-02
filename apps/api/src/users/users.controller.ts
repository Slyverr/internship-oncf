import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { UserId } from "./users.types";

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	async findOneById(@Param("id") id: UserId) {
		return this.usersService.findOneById(id);
	}
}
