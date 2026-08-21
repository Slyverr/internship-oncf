import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	Request,
	UseGuards,
} from "@nestjs/common";
import { ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { AuthService } from "./auth.service";
import type { AuthRequest, LocalAuthRequest } from "./auth.types";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Public } from "./public.decorator";
import { ChangePasswordDto } from "./requests/change-password.dto";
import { ForgotPasswordDto } from "./requests/forgot-password.dto";
import { LoginDto } from "./requests/login.dto";
import { ResetPasswordDto } from "./requests/reset-password.dto";
import { UpdateProfileDto } from "./requests/update-profile.dto";
import { LoginDetailDto } from "./responses/login-detail.dto";
import { ProfileDto } from "./responses/profile.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@UseGuards(LocalAuthGuard)
	@ApiOkResponse({ type: LoginDetailDto })
	@ApiUnauthorizedResponse()
	async login(@Request() req: LocalAuthRequest, @Body() _dto: LoginDto) {
		return this.authService.login(req.user);
	}

	@Get("profile")
	@ApiOkResponse({ type: ProfileDto })
	@ApiUnauthorizedResponse()
	async getProfile(@Request() req: AuthRequest) {
		return plainToInstance(ProfileDto, req.user);
	}

	@Put("profile")
	@ApiOkResponse({ type: ProfileDto })
	@ApiUnauthorizedResponse()
	async updateProfile(
		@Body() dto: UpdateProfileDto,
		@Request() req: AuthRequest,
	) {
		const user = await this.authService.updateProfile(req.user.id, dto);

		return plainToInstance(ProfileDto, {
			...user,
			permissions: new Set(user.permissions ?? []),
		});
	}

	@Post("change-password")
	async changePassword(
		@Body() dto: ChangePasswordDto,
		@Request() req: AuthRequest,
	) {
		await this.authService.changePassword(req.user.id, dto);

		return {
			message: "Password changed successfully",
		};
	}

	@Post("logout")
	async logout(@Request() req: AuthRequest) {
		await this.authService.logout(req.user);

		return {
			message: "Logged out successfully",
		};
	}

	@Public()
	@Post("forgot-password")
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto.email, dto.redirectUrl);

		return {
			message:
				"If an account exists with this email, a reset link has been sent.",
		};
	}

	@Public()
	@Post("reset-password")
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.token, dto.newPassword);

		return {
			message: "Password has been reset successfully",
		};
	}
}
