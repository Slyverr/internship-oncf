import { Permission } from "@ecommand/shared";
import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Permissions } from "src/auth/permissions.decorator";
import { UsersResponseDto } from "./dto/users.response.dto";
import { UsersService } from "./users.service";
import type { UserId } from "./users.types";

const UserIdParam = () => Param("id", ParseIntPipe);

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	@Permissions(Permission.USERS_READ)
	@ApiOkResponse({ type: [UsersResponseDto] })
	@ApiUnauthorizedResponse()
	async findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.USERS_READ)
	@ApiOkResponse({ type: UsersResponseDto })
	@ApiUnauthorizedResponse()
	@ApiNotFoundResponse()
	async findOneById(@UserIdParam() id: UserId) {
		return this.usersService.findOneById(id);
	}
}
