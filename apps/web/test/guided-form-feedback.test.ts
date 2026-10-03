import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = resolve(process.cwd(), "src/components");
const actions = readFileSync(
	resolve(sourceRoot, "common/guided-form.tsx"),
	"utf8",
);
const guidedForms = [
	"claims/claim-create-form.tsx",
	"customers/customer-create-form.tsx",
	"customers/customer-edit-form.tsx",
	"orders/order-create-form.tsx",
	"orders/order-edit-form.tsx",
	"programs/program-create-form.tsx",
	"users/user-create-form.tsx",
	"users/user-edit-form.tsx",
];

assert.match(
	actions,
	/errorMessage\?: string/,
	"the shared guided actions accept a localized submission error",
);
assert.match(
	actions,
	/<p role="alert" className="text-sm text-destructive">/,
	"submission errors are announced and use the shared destructive treatment",
);

for (const path of guidedForms) {
	const source = readFileSync(resolve(sourceRoot, path), "utf8");
	assert.match(
		source,
		/errorMessage=/,
		`${path} displays its save failure through the shared guided actions`,
	);
}

console.log("Guided form submission feedback checks passed.");
