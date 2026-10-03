import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const selectorFiles = [
	"components/customers/customer-select.tsx",
	"components/customers/customer-type-select.tsx",
	"components/goods/good-select.tsx",
	"components/orders/order-select.tsx",
	"components/units/unit-select.tsx",
	"components/users/user-select.tsx",
];

for (const file of selectorFiles) {
	const source = readFileSync(resolve(sourceRoot, file), "utf8");
	assert.doesNotMatch(
		source,
		/oncf-field/,
		`${file} renders a field wrapper; form call sites must own label/control/help layout`,
	);
}

console.log("Shared selector field-layout checks passed.");
