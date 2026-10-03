import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const dashboardShell = readFileSync(
	resolve(sourceRoot, "components/common/dashboard-shell.tsx"),
	"utf8",
);
assert.match(
	dashboardShell,
	/workspaceContentClassName[\s\S]*?overflow-x-clip[\s\S]*?\[&>\*\]:min-w-0/,
	"The workspace must contain wide table scrollers without widening the page.",
);
const tableFiles = [
	"components/claims/claims-table.tsx",
	"components/customers/customers-table.tsx",
	"components/orders/eligible-orders-table.tsx",
	"components/orders/orders-table.tsx",
	"components/programs/programs-table.tsx",
	"components/users/users-table.tsx",
];
const sortableTableFiles = [
	"components/claims/claims-table.tsx",
	"components/customers/customers-table.tsx",
	"components/orders/orders-table.tsx",
	"components/programs/programs-table.tsx",
	"components/users/users-table.tsx",
];
const sortableTableFeatures = readFileSync(
	resolve(sourceRoot, "components/common/sortable-table-features.ts"),
	"utf8",
);
assert.match(
	sortableTableFeatures,
	/sortFns:\s*\{[\s\S]*alphanumeric:\s*sortFn_alphanumeric[\s\S]*datetime:\s*sortFn_datetime/,
	"Shared sortable table features must register the built-in comparators used by columns.",
);

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

const sortButton = readFileSync(
	resolve(sourceRoot, "components/common/table-sort-button.tsx"),
	"utf8",
);
assert.match(
	sortButton,
	/className=\{`flex w-full items-center gap-2 text-left/,
	"The shared sort control must own the sortable heading layout.",
);
assert.match(
	sortButton,
	/disabled=\{!canSort\}[\s\S]*?onClick=\{onClick\}/,
	"The shared sort control must preserve disabled and click behavior.",
);
assert.match(
	sortButton,
	/Messages\.common\.accessibility\.sortedAscending[\s\S]*Messages\.common\.accessibility\.sortedDescending/,
	"The active sort direction must be announced by the shared control.",
);
assert.match(
	sortButton,
	/<ChevronUpIcon[\s\S]*?<ChevronDownIcon/,
	"The sort indicator must keep both chevrons visible and light the active direction.",
);

for (const file of sortableTableFiles) {
	const source = readFileSync(resolve(sourceRoot, file), "utf8");
	assert.match(
		source,
		/sortableTableFeatures as features/,
		`${file} must use the shared comparator registry`,
	);
	assert.match(source, /<TableSortButton/, `${file} must use TableSortButton`);
	assert.match(
		source,
		/state: \{ sorting \}/,
		`${file} must derive displayed sorting from the URL state`,
	);
	assert.match(
		source,
		/defaultSortBy:/,
		`${file} must expose its default sorted column on first render`,
	);
	assert.doesNotMatch(
		source,
		/getToggleSortingHandler/,
		`${file} must not maintain a second local sort state`,
	);
	assert.doesNotMatch(
		source,
		/Chevron(?:Down|Up)Icon|ChevronsUpDownIcon|flex w-full items-center gap-2 text-left/,
		`${file} must not duplicate sortable heading icons or layout`,
	);
}

for (const file of [
	"components/claims/claims-table.tsx",
	"components/customers/customers-table.tsx",
	"components/orders/orders-table.tsx",
	"components/users/users-table.tsx",
]) {
	const source = readFileSync(resolve(sourceRoot, file), "utf8");
	assert.match(
		source,
		/canSort=/,
		`${file} must explicitly declare which columns can be sorted`,
	);
	assert.match(
		source,
		/aria-sort=/,
		`${file} must expose the active direction on its table header`,
	);
}

const tableSortState = readFileSync(
	resolve(sourceRoot, "hooks/use-table-query-state.ts"),
	"utf8",
);
assert.match(
	tableSortState,
	/searchParams\.get\("sortBy"\) \?\? sortBy \?\? defaultSortBy/,
	"Table sorting must prefer the URL, then server sort, then a page default.",
);
assert.match(
	tableSortState,
	/const sorting: SortingState = activeSortBy[\s\S]*?id: activeSortBy, desc: activeSortOrder === "desc"/,
	"The displayed sort column and direction must be derived from the active query state.",
);

console.log("Shared table-frame and sortable-header checks passed.");
