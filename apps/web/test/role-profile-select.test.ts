import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const selectSource = readFileSync(
	resolve(process.cwd(), "src/components/users/role-profile-select.tsx"),
	"utf8",
);
const userForms = ["user-create-form.tsx", "user-edit-form.tsx"].map((file) =>
	readFileSync(resolve(process.cwd(), `src/components/users/${file}`), "utf8"),
);

assert.match(
	selectSource,
	/InlineQueryRetry/,
	"role-profile lookup failures expose the shared retry control",
);
assert.match(
	selectSource,
	/disabled=\{disabled \|\| profiles\.length === 0\}/,
	"stale role profiles remain selectable, while an empty result cannot be selected",
);
for (const source of userForms) {
	assert.match(source, /isError=\{roleProfilesQuery\.isError\}/);
	assert.match(source, /isFetching=\{roleProfilesQuery\.isFetching\}/);
	assert.match(source, /roleProfilesQuery\.refetch\(\)/);
}

console.log("Role-profile lookup recovery checks passed.");
