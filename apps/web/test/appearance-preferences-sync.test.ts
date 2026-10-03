import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
	resolve(process.cwd(), "src/providers/appearance-preferences-sync.tsx"),
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

console.log("Appearance preference revalidation checks passed.");
