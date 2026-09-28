import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
	@IsString()
	@MinLength(1)
	@Matches(/\S/)
	@MaxLength(100)
	username: string;

	@IsString()
	@MinLength(8)
	password: string;
}
