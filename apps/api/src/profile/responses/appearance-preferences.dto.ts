import type { AppearancePreferences } from "@ecommand/shared";
import {
	APPEARANCE_FONT_FAMILIES,
	APPEARANCE_MOTION_PREFERENCES,
	APPEARANCE_TEXT_SIZES,
	APPEARANCE_THEMES,
} from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class AppearancePreferencesDto implements AppearancePreferences {
	@ApiProperty({ enum: APPEARANCE_THEMES })
	theme: AppearancePreferences["theme"];

	@ApiProperty({ enum: APPEARANCE_FONT_FAMILIES })
	fontFamily: AppearancePreferences["fontFamily"];

	@ApiProperty({ enum: APPEARANCE_TEXT_SIZES })
	textSize: AppearancePreferences["textSize"];

	@ApiProperty({ enum: APPEARANCE_MOTION_PREFERENCES })
	motion: AppearancePreferences["motion"];

	@ApiProperty()
	updatedAt: string;
}
