import { Permission, RolePersona } from "@ecommand/shared";
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";
import { CUSTOM_ROLE_PERSONAS } from "../role-profile-policy";

export class CreateRoleProfileDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string | null;

	@IsIn(CUSTOM_ROLE_PERSONAS)
	persona: Exclude<RolePersona, RolePersona.ADMIN>;

	@IsArray()
	@ArrayMaxSize(Object.values(Permission).length)
	@ArrayUnique()
	@IsEnum(Permission, { each: true })
	permissionNames: Permission[];
}
