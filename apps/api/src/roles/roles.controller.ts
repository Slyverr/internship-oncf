import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	ParseUUIDPipe,
	Patch,
	Post,
	Request,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ApiStringPathParam } from "@/common/decorators/api-path-param.decorator";
import { CreateRoleProfileDto } from "./requests/create-role-profile.dto";
import { UpdateRoleProfileDto } from "./requests/update-role-profile.dto";
import {
	PermissionDefinitionDto,
	RoleProfileDto,
} from "./responses/role-profile.dto";
import { RolesService } from "./roles.service";

const { list: RoleProfileListResponse, create: RoleProfileCreateResponse } =
	createCrudResponses({
		list: RoleProfileDto,
		detail: RoleProfileDto,
		create: RoleProfileDto,
	});
const { update: RoleProfileUpdateResponse } = createCrudResponses({
	list: RoleProfileDto,
	detail: RoleProfileDto,
	update: RoleProfileDto,
});
const { list: PermissionDefinitionListResponse } = createCrudResponses({
	list: PermissionDefinitionDto,
	detail: PermissionDefinitionDto,
});

@Controller("roles")
@RequireAny(Permission.ROLES_MANAGE)
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@Get()
	@RoleProfileListResponse()
	async findProfiles() {
		return this.rolesService.findProfiles();
	}

	@Get("permissions")
	@PermissionDefinitionListResponse()
	async findPermissionDefinitions() {
		return this.rolesService.findPermissionDefinitions();
	}

	@Post()
	@RoleProfileCreateResponse()
	async createProfile(
		@Body() dto: CreateRoleProfileDto,
		@Request() request: AuthRequest,
	) {
		return this.rolesService.createProfile(dto, request.user.id);
	}

	@Patch(":id")
	@RoleProfileUpdateResponse()
	async updateProfile(
		@ApiStringPathParam("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateRoleProfileDto,
		@Request() request: AuthRequest,
	) {
		return this.rolesService.updateProfile(id, dto, request.user.id);
	}
}
