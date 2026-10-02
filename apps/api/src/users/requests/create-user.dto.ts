import { Role } from "@ecommand/shared";
import {
	ArrayUnique,
	IsArray,
	IsBoolean,
	IsEmail,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
	MinLength,
} from "class-validator";

export class CreateUserDto {
	@IsEmail()
	@MaxLength(100)
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(255)
	password: string;

	@IsString()
	@MaxLength(100)
	firstName: string;

	@IsString()
	@MaxLength(100)
	lastName: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role;

	@IsOptional()
	@IsUUID()
	roleId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	employeeCode?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	type?: "internal" | "external";

	@IsOptional()
	@IsInt()
	@Min(1)
	customerId?: number;

	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsInt({ each: true })
	@Min(1, { each: true })
	customerIds?: number[];

	@IsOptional()
	@IsInt()
	agencyId?: number;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
