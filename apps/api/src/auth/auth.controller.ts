import { API_RESPONSE_CODES } from "@ecommand/shared";
import {
	Body,
	Controller,
	HttpStatus,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { ApiCodedErrorResponse } from "@/common/decorators/api-coded-error-response.decorator";
import { SuccessResponseDto } from "@/common/responses/success-response.dto";
import { AuthService } from "./auth.service";
import type { AuthRequest, LocalAuthRequest } from "./auth.types";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Public } from "./public.decorator";
import { ChangePasswordDto } from "./requests/change-password.dto";
import { ForgotPasswordDto } from "./requests/forgot-password.dto";
import { LoginDto } from "./requests/login.dto";
import { RegisterClientDto } from "./requests/register-client.dto";
import { ResetPasswordDto } from "./requests/reset-password.dto";
import { LoginDetailDto } from "./responses/login-detail.dto";
import { RegistrationSubmittedDto } from "./responses/registration-submitted.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@UseGuards(LocalAuthGuard)
	@ApiOkResponse({ type: LoginDetailDto })
	@ApiCodedErrorResponse(HttpStatus.UNAUTHORIZED)
	async login(@Request() req: LocalAuthRequest, @Body() _dto: LoginDto) {
		return this.authService.login(req.user);
	}

	@Public()
	@Post("register")
	@ApiOkResponse({ type: RegistrationSubmittedDto })
	async register(@Body() dto: RegisterClientDto) {
		return this.authService.register(dto);
	}

	@Post("change-password")
	@ApiOkResponse({ type: SuccessResponseDto })
	async changePassword(
		@Body() dto: ChangePasswordDto,
		@Request() req: AuthRequest,
	) {
		await this.authService.changePassword(req.user.id, dto);

		return {
			code: API_RESPONSE_CODES.AUTH_PASSWORD_CHANGED,
		};
	}

	@Post("logout")
	@ApiOkResponse({ type: SuccessResponseDto })
	async logout(@Request() req: AuthRequest) {
		await this.authService.logout(req.user);

		return {
			code: API_RESPONSE_CODES.AUTH_LOGGED_OUT,
		};
	}

	@Public()
	@Post("forgot-password")
	@ApiOkResponse({ type: SuccessResponseDto })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto.email);

		return {
			code: API_RESPONSE_CODES.AUTH_PASSWORD_RESET_REQUEST_ACCEPTED,
		};
	}

	@Public()
	@Post("reset-password")
	@ApiOkResponse({ type: SuccessResponseDto })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.token, dto.newPassword);

		return {
			code: API_RESPONSE_CODES.AUTH_PASSWORD_RESET,
		};
	}
}
