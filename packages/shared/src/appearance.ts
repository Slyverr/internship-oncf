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

export const APPEARANCE_WORKSPACE_LAYOUTS = [
	"sidebar",
	"centered-header",
] as const;

export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];
export type AppearanceFontFamily = (typeof APPEARANCE_FONT_FAMILIES)[number];
export type AppearanceTextSize = (typeof APPEARANCE_TEXT_SIZES)[number];
export type AppearanceMotionPreference =
	(typeof APPEARANCE_MOTION_PREFERENCES)[number];
export type AppearanceWorkspaceLayout =
	(typeof APPEARANCE_WORKSPACE_LAYOUTS)[number];

export interface AppearancePreferences {
	theme: AppearanceTheme;
	fontFamily: AppearanceFontFamily;
	textSize: AppearanceTextSize;
	motion: AppearanceMotionPreference;
	workspaceLayout: AppearanceWorkspaceLayout;
}

export const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
	theme: "system",
	fontFamily: "inter",
	textSize: "default",
	motion: "system",
	workspaceLayout: "sidebar",
};
