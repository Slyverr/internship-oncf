import { IsEmail, IsUrl } from "class-validator";

export class ForgotPasswordDto {
	@IsEmail()
	email: string;

	@IsUrl()
	redirectUrl: string;
}
