export const APPEARANCE_THEMES = [
	"system",
	"light",
	"dark",
	"mono-light",
	"mono-dark",
] as const;

export const APPEARANCE_FONT_FAMILIES = ["inter", "geist", "system"] as const;

export const APPEARANCE_TEXT_SIZES = ["small", "default", "large"] as const;

export const APPEARANCE_MOTION_PREFERENCES = ["system", "reduced"] as const;

export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];
export type AppearanceFontFamily = (typeof APPEARANCE_FONT_FAMILIES)[number];
export type AppearanceTextSize = (typeof APPEARANCE_TEXT_SIZES)[number];
export type AppearanceMotionPreference =
	(typeof APPEARANCE_MOTION_PREFERENCES)[number];

export interface AppearancePreferences {
	theme: AppearanceTheme;
	fontFamily: AppearanceFontFamily;
	textSize: AppearanceTextSize;
	motion: AppearanceMotionPreference;
}

export const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
	theme: "system",
	fontFamily: "inter",
	textSize: "default",
	motion: "system",
};
