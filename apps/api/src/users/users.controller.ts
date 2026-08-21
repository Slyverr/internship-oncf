import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Request,
} from "@nestjs/common";
import type { AuthRequest } from "src/auth/auth.types";
import { RequireAny } from "src/auth/permissions.decorator";
import { createCrudResponses } from "src/common/decorators/api-crud-responses.decorator";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { UserDeleteDto } from "./responses/user-delete.dto";
import { UserDetailDto } from "./responses/user-detail.dto";
import { UserListDto } from "./responses/user-list.dto";
import { UsersService } from "./users.service";
import type { UserId } from "./users.types";

const UserIdParam = () => Param("id", ParseIntPipe);

const {
	list: UserListResponse,
	detail: UserDetailResponse,
	create: UserCreateResponse,
	remove: UserDeleteResponse,
} = createCrudResponses({
	list: UserListDto,
	detail: UserDetailDto,
	remove: UserDeleteDto,
});

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@RequireAny(Permission.USERS_READ)
	@UserListResponse()
	async findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	@RequireAny(Permission.USERS_READ)
	@UserDetailResponse()
	async findOne(@UserIdParam() id: UserId) {
		return this.usersService.findOne(id);
	}

	@Post()
	@RequireAny(Permission.USERS_CREATE)
	@UserCreateResponse()
	async create(@Body() dto: CreateUserDto, @Request() req: AuthRequest) {
		return this.usersService.create(dto, req.user);
	}

	@Put(":id")
	@RequireAny(Permission.USERS_UPDATE)
	@UserDetailResponse()
	async update(
		@UserIdParam() id: UserId,
		@Body() dto: UpdateUserDto,
		@Request() req: AuthRequest,
	) {
		return this.usersService.update(id, dto, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.USERS_DELETE)
	@UserDeleteResponse()
	async deactivate(@UserIdParam() id: UserId) {
		return this.usersService.deactivate(id);
	}
}
