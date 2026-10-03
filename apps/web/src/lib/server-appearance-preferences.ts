import type { AppearancePreferences } from "@ecommand/shared";
import { cookies } from "next/headers";
import { profileControllerGetPreferences } from "@/lib/api/profile";
import { parseAppearancePreferenceCookie } from "@/lib/appearance-preference-cookie";

const SERVER_PREFERENCE_TIMEOUT_MS = 3_000;
const PREFERENCE_COOKIE = "ecommand-appearance";

type ServerAppearancePreferenceDependencies = {
	getCookies?: typeof cookies;
	getPreferences?: typeof profileControllerGetPreferences;
};

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

export async function getServerAppearancePreferences({
	getCookies = cookies,
	getPreferences = profileControllerGetPreferences,
}: ServerAppearancePreferenceDependencies = {}): Promise<AppearancePreferences | null> {
	const requestCookies = await getCookies();
	const token = requestCookies.get("access_token")?.value;
	if (!token) return null;

	const userId = getTokenUserId(token);
	const cachedPreferences = userId
		? parseAppearancePreferenceCookie(
				requestCookies.get(PREFERENCE_COOKIE)?.value,
				userId,
			)
		: null;
	try {
		const preferences = await getPreferences({
			timeout: SERVER_PREFERENCE_TIMEOUT_MS,
		});
		if (!preferences) return cachedPreferences;

		return {
			theme: preferences.theme,
			fontFamily: preferences.fontFamily,
			textSize: preferences.textSize,
			motion: preferences.motion,
			workspaceLayout: preferences.workspaceLayout,
		};
	} catch {
		// Prefer the database when it is reachable, while retaining the last local
		// appearance if the API is unavailable during a page request.
		return cachedPreferences;
	}
}
