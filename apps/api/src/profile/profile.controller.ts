import { Permission } from "@ecommand/shared";
import { Body, Controller, Get, Put, Request } from "@nestjs/common";
import { ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./requests/update-profile.dto";
import { ProfileDto } from "./responses/profile.dto";

@Controller("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@ApiOkResponse({ type: ProfileDto })
	@ApiUnauthorizedResponse()
	async getCurrent(@Request() req: AuthRequest) {
		return this.profileService.findOne(req.user.id);
	}

	@Put()
	@RequireAny(Permission.PROFILE_UPDATE)
	@ApiOkResponse({ type: ProfileDto })
	@ApiUnauthorizedResponse()
	async update(@Body() dto: UpdateProfileDto, @Request() req: AuthRequest) {
		return this.profileService.update(req.user.id, dto);
	}
}
