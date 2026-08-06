import {
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { AuthRequest, LocalAuthRequest } from "./auth.types";
import { LoginDto } from "./dto/login.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@UseGuards(LocalAuthGuard)
	async login(@Request() req: LocalAuthRequest, @Body() _loginDto: LoginDto) {
		return this.authService.login(req.user);
	}

	@Get("profile")
	getProfile(@Request() req: AuthRequest) {
		return req.user;
	}
}
