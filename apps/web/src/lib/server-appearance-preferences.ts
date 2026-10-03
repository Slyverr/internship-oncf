import type { AppearancePreferences } from "@ecommand/shared";
import { cookies } from "next/headers";
import { profileControllerGetPreferences } from "@/lib/api/profile";
import { parseAppearancePreferenceCookie } from "@/lib/appearance-preference-cookie";

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

export async function getServerAppearancePreferences(): Promise<AppearancePreferences | null> {
	const requestCookies = await cookies();
	const token = requestCookies.get("access_token")?.value;
	if (!token) return null;

	const userId = getTokenUserId(token);
	const cachedPreferences = userId
		? parseAppearancePreferenceCookie(
				requestCookies.get(PREFERENCE_COOKIE)?.value,
				userId,
			)
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
