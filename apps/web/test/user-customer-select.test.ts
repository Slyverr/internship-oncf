import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync(
	new URL("../src/components/users/user-customer-select.tsx", import.meta.url),
	"utf8",
);

assert.match(
	component,
	/useCustomersControllerFindPortfolioOptions\(\)/,
	"user assignment uses the customer options endpoint available to user managers",
);
assert.doesNotMatch(
	component,
	/useCustomersControllerFindAll/,
	"user assignment does not depend on broad customer-read permission",
);

for (const formPath of [
	"../src/components/users/user-create-form.tsx",
	"../src/components/users/user-edit-form.tsx",
]) {
	const form = readFileSync(new URL(formPath, import.meta.url), "utf8");
	assert.match(
		form,
		/<UserCustomerSelect\b/,
		`${formPath} uses the user-management customer selector`,
	);
}

console.log(
	"User assignment customer selector permission contract checks passed.",
);
