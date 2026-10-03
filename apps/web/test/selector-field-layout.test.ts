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

const customerTypeSelector = readFileSync(
	resolve(sourceRoot, "components/customers/customer-type-select.tsx"),
	"utf8",
);
assert.match(
	customerTypeSelector,
	/<ComboboxInput\s+id=\{id\}\s+className="w-full"/,
	"Customer type control should fill its grid column like sibling inputs",
);

const customerCreateForm = readFileSync(
	resolve(sourceRoot, "components/customers/customer-create-form.tsx"),
	"utf8",
);
assert.match(
	customerCreateForm,
	/<div className="grid items-start gap-4 @3xl\/workspace:col-span-2 @3xl\/workspace:grid-cols-2">/,
	"Customer identity fields should align to the top within their responsive grid row",
);

console.log("Shared selector field-layout checks passed.");
