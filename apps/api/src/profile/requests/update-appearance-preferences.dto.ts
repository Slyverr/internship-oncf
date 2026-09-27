import {
	APPEARANCE_FONT_FAMILIES,
	APPEARANCE_MOTION_PREFERENCES,
	APPEARANCE_TEXT_SIZES,
	APPEARANCE_THEMES,
	type AppearanceFontFamily,
	type AppearanceMotionPreference,
	type AppearanceTextSize,
	type AppearanceTheme,
} from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateAppearancePreferencesDto {
	@ApiProperty({ enum: APPEARANCE_THEMES })
	@IsIn(APPEARANCE_THEMES)
	theme: AppearanceTheme;

	@ApiProperty({ enum: APPEARANCE_FONT_FAMILIES })
	@IsIn(APPEARANCE_FONT_FAMILIES)
	fontFamily: AppearanceFontFamily;

	@ApiProperty({ enum: APPEARANCE_TEXT_SIZES })
	@IsIn(APPEARANCE_TEXT_SIZES)
	textSize: AppearanceTextSize;

	@ApiProperty({ enum: APPEARANCE_MOTION_PREFERENCES })
	@IsIn(APPEARANCE_MOTION_PREFERENCES)
	motion: AppearanceMotionPreference;
}
