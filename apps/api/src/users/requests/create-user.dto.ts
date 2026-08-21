import { Role } from "@ecommand/shared";
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
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

	@IsEnum(Role)
	role: Role;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	employeeId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	type?: "internal" | "external";

	@IsOptional()
	@IsInt()
	customerId?: number;

	@IsOptional()
	@IsInt()
	agencyId?: number;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
