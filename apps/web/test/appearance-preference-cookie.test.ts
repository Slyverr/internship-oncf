import assert from "node:assert/strict";
import {
	type AppearancePreferences,
	DEFAULT_APPEARANCE_PREFERENCES,
} from "@ecommand/shared";
import {
	parseAppearancePreferenceCookie,
	parseAppearancePreferenceSnapshot,
	serializeAppearancePreferenceCookie,
} from "../src/lib/appearance-preference-cookie";

const preferences: AppearancePreferences = {
	...DEFAULT_APPEARANCE_PREFERENCES,
	theme: "mono-dark",
	workspaceLayout: "centered-header",
};

const encoded = serializeAppearancePreferenceCookie(preferences, 42);
assert.deepEqual(parseAppearancePreferenceCookie(encoded, 42), preferences);
assert.equal(parseAppearancePreferenceCookie(encoded, 43), null);
assert.equal(parseAppearancePreferenceCookie("not-json", 42), null);
assert.equal(parseAppearancePreferenceCookie(undefined, 42), null);
const offlineSnapshot = serializeAppearancePreferenceCookie(
	preferences,
	42,
	null,
);
assert.deepEqual(
	parseAppearancePreferenceSnapshot(offlineSnapshot, 42),
	{ preferences, updatedAt: null },
	"an offline fallback must not claim to be newer than the database",
);

const invalidValues = encodeURIComponent(
	JSON.stringify({
		userId: 42,
		preferences: {
			theme: "injected-theme",
			fontFamily: "injected-font",
			textSize: "injected-size",
			motion: "injected-motion",
			workspaceLayout: "injected-layout",
		},
	}),
);
assert.deepEqual(
	parseAppearancePreferenceCookie(invalidValues, 42),
	DEFAULT_APPEARANCE_PREFERENCES,
);

console.log("User-scoped appearance preference cookie checks passed.");
