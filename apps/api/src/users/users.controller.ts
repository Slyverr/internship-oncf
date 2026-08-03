import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { Permissions } from "src/auth/permissions.decorator";
import { UsersService } from "./users.service";
import type { UserId } from "./users.types";

const UserIdParam = () => Param("id", ParseIntPipe);

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
	async findOneById(@UserIdParam() id: UserId) {
		return this.usersService.findOneById(id);
	}
}
