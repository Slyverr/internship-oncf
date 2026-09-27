import { STRONG_PASSWORD_PATTERN } from "@ecommand/shared";
import { IsString, Matches } from "class-validator";

export class ResetPasswordDto {
	@IsString()
	token: string;

	@IsString()
	@Matches(STRONG_PASSWORD_PATTERN)
	newPassword: string;
}
