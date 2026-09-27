import { Permission } from "@ecommand/shared";
import { Body, Controller, Get, Put, Request } from "@nestjs/common";
import {
	ApiExtraModels,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { ProfileService } from "./profile.service";
import { UpdateAppearancePreferencesDto } from "./requests/update-appearance-preferences.dto";
import { UpdateProfileDto } from "./requests/update-profile.dto";
import { AppearancePreferencesDto } from "./responses/appearance-preferences.dto";
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

	@Get("preferences")
	@ApiExtraModels(AppearancePreferencesDto)
	@ApiOkResponse({
		schema: {
			allOf: [{ $ref: getSchemaPath(AppearancePreferencesDto) }],
			nullable: true,
		},
	})
	@ApiUnauthorizedResponse()
	async getPreferences(@Request() req: AuthRequest) {
		return this.profileService.findPreferences(req.user.id);
	}

	@Put("preferences")
	@RequireAny(Permission.PROFILE_UPDATE)
	@ApiOkResponse({ type: AppearancePreferencesDto })
	@ApiUnauthorizedResponse()
	async updatePreferences(
		@Body() dto: UpdateAppearancePreferencesDto,
		@Request() req: AuthRequest,
	) {
		return this.profileService.updatePreferences(req.user.id, dto);
	}

	@Put()
	@RequireAny(Permission.PROFILE_UPDATE)
	@ApiOkResponse({ type: ProfileDto })
	@ApiUnauthorizedResponse()
	async update(@Body() dto: UpdateProfileDto, @Request() req: AuthRequest) {
		return this.profileService.update(req.user.id, dto);
	}
}
