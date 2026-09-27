import { STRONG_PASSWORD_PATTERN } from "@ecommand/shared";
import { IsString, Matches } from "class-validator";

export class ChangePasswordDto {
	@IsString()
	currentPassword: string;

	@IsString()
	@Matches(STRONG_PASSWORD_PATTERN)
	newPassword: string;
}
