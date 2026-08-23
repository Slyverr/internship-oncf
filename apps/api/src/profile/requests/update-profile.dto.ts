import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
	@IsOptional()
	@IsEmail()
	@MaxLength(100)
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	firstName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	lastName?: string;
}
