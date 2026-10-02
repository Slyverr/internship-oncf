import assert from "node:assert/strict";
import {
	ClaimStatus,
	DEFAULT_LOCALE,
	OrderStatus,
	ProgramStatus,
} from "@ecommand/shared";
import {
	getClaimStatusLabel,
	getOrderNotificationStatusLabel,
	getOrderStatusLabel,
	getProgramStatusLabel,
} from "../src/i18n/status-labels";

assert.equal(
	getOrderStatusLabel(OrderStatus.PARTIALLY_EXECUTED),
	"Partially executed",
);
assert.equal(
	getOrderStatusLabel(OrderStatus.PARTIALLY_EXECUTED, DEFAULT_LOCALE),
	"Partially executed",
);
assert.equal(
	getProgramStatusLabel(ProgramStatus.PENDING_APPROVAL),
	"Pending approval",
);
assert.equal(getClaimStatusLabel(ClaimStatus.IN_TREATMENT), "In treatment");
assert.equal(getOrderStatusLabel("UNRECOGNIZED"), "Unknown status");
assert.equal(getProgramStatusLabel("UNRECOGNIZED"), "Unknown status");
assert.equal(getClaimStatusLabel("UNRECOGNIZED"), "Unknown status");
assert.equal(getOrderNotificationStatusLabel("MISSING"), "updated");

console.log("Shared localized workflow status checks passed.");
