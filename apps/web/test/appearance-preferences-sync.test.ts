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

console.log("Appearance preference revalidation checks passed.");
