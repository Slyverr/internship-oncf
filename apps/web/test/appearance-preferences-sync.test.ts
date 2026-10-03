import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
	resolve(process.cwd(), "src/providers/appearance-preferences-sync.tsx"),
	"utf8",
);
const providerSource = readFileSync(
	resolve(process.cwd(), "src/providers/appearance-provider.tsx"),
	"utf8",
);
const dashboardShellSource = readFileSync(
	resolve(process.cwd(), "src/components/common/dashboard-shell.tsx"),
	"utf8",
);
const firstFetchGuard = source.indexOf(
	"if (!preferencesQuery.isFetched) return;",
);
const hydratedFlag = source.indexOf("hydrated.current = true;");

assert.notEqual(firstFetchGuard, -1, "Wait for the first preference API read.");
assert.ok(
	firstFetchGuard < hydratedFlag,
	"Do not treat initialData as canonical before the API revalidation finishes.",
);

const initializationEffect = providerSource.indexOf(
	"useAppearanceInitializationEffect(() => {",
);
const storedPreferenceRead = providerSource.indexOf(
	"const storedPreferences = initialPreferences ?? readPreferences();",
);
assert.notEqual(
	initializationEffect,
	-1,
	"Initialize appearance before paint.",
);
assert.ok(
	initializationEffect < storedPreferenceRead,
	"Read the local appearance fallback in the pre-paint initialization effect.",
);
assert.ok(
	source.includes(
		"if (!serverPreferencesAvailable) {\n\t\t\t\t// When SSR could not reach the preference API",
	),
	"Cache the local preference for server rendering when no server snapshot exists.",
);
assert.ok(
	source.includes(
		"writeAppearancePreferenceCookie(preferences, profile.id, null);",
	),
	"Mark an offline render cache as unversioned so a database value remains authoritative.",
);
assert.ok(
	dashboardShellSource.includes(
		"const selectedLayout = preferences.workspaceLayout;",
	),
	"Render the server-provided workspace layout without a client initialization fallback.",
);
assert.ok(
	!dashboardShellSource.includes(
		'initialized ? preferences.workspaceLayout : "sidebar"',
	),
	"Do not flash the sidebar before the saved workspace layout initializes.",
);

console.log("Appearance preference revalidation checks passed.");
