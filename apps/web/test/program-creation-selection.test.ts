import assert from "node:assert/strict";
import { shouldClearInitialOrderSelection } from "../src/lib/program-creation-eligibility";

const settledMissingOrder = {
	initialOrderId: 42,
	selectedOrderId: 42,
	eligibleOrderIds: [],
	isLoading: false,
	isFetching: false,
	isError: false,
};

assert.equal(
	shouldClearInitialOrderSelection(settledMissingOrder),
	true,
	"clear a preselected order only after a successful query confirms it is unavailable",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		isLoading: true,
	}),
	false,
	"preserve the preselection while the first eligibility query is loading",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		isFetching: true,
	}),
	false,
	"preserve the preselection during a background refresh or retry",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		isError: true,
	}),
	false,
	"preserve the preselection when the eligibility query fails",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		eligibleOrderIds: [42],
	}),
	false,
	"keep the preselection while the order remains eligible",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		selectedOrderId: 43,
	}),
	false,
	"preserve a different order selected manually by the user",
);
assert.equal(
	shouldClearInitialOrderSelection({
		...settledMissingOrder,
		initialOrderId: undefined,
	}),
	false,
	"leave forms without an initial order selection unchanged",
);

console.log("Program creation selection checks passed.");
