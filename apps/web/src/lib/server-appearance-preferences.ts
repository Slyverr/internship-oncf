import {
	APPEARANCE_FONT_FAMILIES,
	APPEARANCE_MOTION_PREFERENCES,
	APPEARANCE_TEXT_SIZES,
	APPEARANCE_THEMES,
	APPEARANCE_WORKSPACE_LAYOUTS,
	type AppearancePreferences,
	DEFAULT_APPEARANCE_PREFERENCES,
} from "@ecommand/shared";
import { cookies } from "next/headers";
import { profileControllerGetPreferences } from "@/lib/api/profile";

const SERVER_PREFERENCE_TIMEOUT_MS = 3_000;
const PREFERENCE_COOKIE = "ecommand-appearance";

function getTokenUserId(token?: string): number | null {
	const payload = token?.split(".")[1];
	if (!payload) return null;

	try {
		const claims = JSON.parse(
			Buffer.from(payload, "base64url").toString("utf8"),
		) as {
			sub?: unknown;
		};
		return typeof claims.sub === "number" ? claims.sub : null;
	} catch {
		return null;
	}
}

function readPreferenceCookie(
	value: string | undefined,
	userId: number,
): AppearancePreferences | null {
	if (!value) return null;

	try {
		const cached = JSON.parse(decodeURIComponent(value)) as {
			userId?: unknown;
			preferences?: Partial<AppearancePreferences>;
		};
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

export async function getServerAppearancePreferences(): Promise<AppearancePreferences | null> {
	const requestCookies = await cookies();
	const token = requestCookies.get("access_token")?.value;
	if (!token) return null;

	const userId = getTokenUserId(token);
	const cachedPreferences = userId
		? readPreferenceCookie(requestCookies.get(PREFERENCE_COOKIE)?.value, userId)
		: null;
	if (cachedPreferences) return cachedPreferences;

	try {
		const preferences = await profileControllerGetPreferences({
			timeout: SERVER_PREFERENCE_TIMEOUT_MS,
		});
		if (!preferences) return null;

		return {
			theme: preferences.theme,
			fontFamily: preferences.fontFamily,
			textSize: preferences.textSize,
			motion: preferences.motion,
			workspaceLayout: preferences.workspaceLayout,
		};
	} catch {
		// Rendering must keep working when the API is unavailable; the browser
		// appearance provider falls back to the locally cached preference.
		return null;
	}
}
