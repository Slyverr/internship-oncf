import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const selectSource = readFileSync(
	join(sourceRoot, "components/ui/select.tsx"),
	"utf8",
);

assert.match(
	selectSource,
	/max-h-\[min\(var\(--available-height\),24rem\)\]/,
	"Select popups must reserve room for the fixed phone navigation",
);
assert.match(
	selectSource,
	/md:max-h-\(--available-height\)/,
	"Select popups should use the available height at tablet and desktop sizes",
);

console.log("Responsive select popup layout checks passed.");
