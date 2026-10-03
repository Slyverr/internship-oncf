import type { AppearancePreferences } from "@ecommand/shared";
import { cookies } from "next/headers";
import { profileControllerGetPreferences } from "@/lib/api/profile";

export async function getServerAppearancePreferences(): Promise<AppearancePreferences | null> {
	if (!(await cookies()).has("access_token")) return null;

	try {
		const preferences = await profileControllerGetPreferences();
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
