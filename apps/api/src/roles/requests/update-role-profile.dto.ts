import { Permission, RolePersona } from "@ecommand/shared";
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsEnum,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";
import { CUSTOM_ROLE_PERSONAS } from "../role-profile-policy";

export class UpdateRoleProfileDto {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string | null;

	@IsOptional()
	@IsIn(CUSTOM_ROLE_PERSONAS)
	persona?: Exclude<RolePersona, RolePersona.ADMIN>;

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(Object.values(Permission).length)
	@ArrayUnique()
	@IsEnum(Permission, { each: true })
	permissionNames?: Permission[];

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
