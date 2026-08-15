import {
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { MessageResponseDto } from "src/common/dto/message.response.dto";
import { AuthService } from "./auth.service";
import type { AuthRequest, LocalAuthRequest } from "./auth.types";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login.response.dto";
import { ProfileResponseDto } from "./dto/profile.response.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@UseGuards(LocalAuthGuard)
	@ApiOkResponse({ type: LoginResponseDto })
	@ApiUnauthorizedResponse()
	async login(@Request() req: LocalAuthRequest, @Body() _loginDto: LoginDto) {
		return this.authService.login(req.user);
	}

	@Get("profile")
	@ApiOkResponse({ type: ProfileResponseDto })
	@ApiUnauthorizedResponse()
	getProfile(@Request() req: AuthRequest) {
		return req.user;
	}

	@Public()
	@Post("forgot-password")
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiBadRequestResponse()
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto.email, dto.redirectUrl);
		return {
			message:
				"If an account exists with this email, a reset link has been sent.",
		};
	}

	@Public()
	@Post("reset-password")
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiBadRequestResponse()
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.token, dto.newPassword);
		return { message: "Password has been reset successfully." };
	}
}
