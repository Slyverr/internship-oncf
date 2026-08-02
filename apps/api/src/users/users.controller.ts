import { Controller, Get, Param } from "@nestjs/common";
import { Permissions } from "src/auth/permissions.decorator";
import { UsersService } from "./users.service";
import type { UserId } from "./users.types";

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	@Permissions("users:read")
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	@Permissions("users:read")
	async findOneById(@Param("id") id: UserId) {
		return this.usersService.findOneById(id);
	}
}
