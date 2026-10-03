import {
	APPEARANCE_FONT_FAMILIES,
	APPEARANCE_MOTION_PREFERENCES,
	APPEARANCE_TEXT_SIZES,
	APPEARANCE_THEMES,
	APPEARANCE_WORKSPACE_LAYOUTS,
	type AppearancePreferences,
	DEFAULT_APPEARANCE_PREFERENCES,
} from "@ecommand/shared";

type CachedAppearancePreferences = {
	userId?: unknown;
	preferences?: Partial<AppearancePreferences>;
};

export function serializeAppearancePreferenceCookie(
	preferences: AppearancePreferences,
	userId: number,
) {
	return encodeURIComponent(JSON.stringify({ userId, preferences }));
}

export function parseAppearancePreferenceCookie(
	value: string | undefined,
	userId: number,
): AppearancePreferences | null {
	if (!value) return null;

	try {
		const cached = JSON.parse(
			decodeURIComponent(value),
		) as CachedAppearancePreferences;
		if (cached.userId !== userId || !cached.preferences) return null;
		const stored = cached.preferences;

		return {
			theme: APPEARANCE_THEMES.includes(
				stored.theme as AppearancePreferences["theme"],
			)
				? (stored.theme as AppearancePreferences["theme"])
				: DEFAULT_APPEARANCE_PREFERENCES.theme,
			fontFamily: APPEARANCE_FONT_FAMILIES.includes(
				stored.fontFamily as AppearancePreferences["fontFamily"],
			)
				? (stored.fontFamily as AppearancePreferences["fontFamily"])
				: DEFAULT_APPEARANCE_PREFERENCES.fontFamily,
			textSize: APPEARANCE_TEXT_SIZES.includes(
				stored.textSize as AppearancePreferences["textSize"],
			)
				? (stored.textSize as AppearancePreferences["textSize"])
				: DEFAULT_APPEARANCE_PREFERENCES.textSize,
			motion: APPEARANCE_MOTION_PREFERENCES.includes(
				stored.motion as AppearancePreferences["motion"],
			)
				? (stored.motion as AppearancePreferences["motion"])
				: DEFAULT_APPEARANCE_PREFERENCES.motion,
			workspaceLayout: APPEARANCE_WORKSPACE_LAYOUTS.includes(
				stored.workspaceLayout as AppearancePreferences["workspaceLayout"],
			)
				? (stored.workspaceLayout as AppearancePreferences["workspaceLayout"])
				: DEFAULT_APPEARANCE_PREFERENCES.workspaceLayout,
		};
	} catch {
		return null;
	}
}
