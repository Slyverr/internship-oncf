import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const tableFiles = [
	"components/claims/claims-table.tsx",
	"components/customers/customers-table.tsx",
	"components/orders/eligible-orders-table.tsx",
	"components/orders/orders-table.tsx",
	"components/programs/programs-table.tsx",
	"components/users/users-table.tsx",
];

const tablePrimitive = readFileSync(
	resolve(sourceRoot, "components/ui/table.tsx"),
	"utf8",
);
assert.match(
	tablePrimitive,
	/data-slot="table-frame"[\s\S]*?cn\("rounded-md border", className\)/,
	"TableFrame must own the common bordered, rounded table surface.",
);

for (const file of tableFiles) {
	const source = readFileSync(resolve(sourceRoot, file), "utf8");
	assert.match(source, /\bTableFrame\b/, `${file} must use TableFrame`);
	assert.doesNotMatch(
		source,
		/className="(?:min-w-0 )?rounded-md border"/,
		`${file} must not duplicate TableFrame styling`,
	);
}

console.log("Shared table-frame styling checks passed.");
