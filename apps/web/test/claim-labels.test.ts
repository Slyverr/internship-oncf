import assert from "node:assert/strict";
import {
	ClaimPriority,
	ClaimStatus,
	ClaimType,
	DEFAULT_LOCALE,
} from "@ecommand/shared";
import {
	getClaimPriorityLabel,
	getClaimStatusLabel,
	getClaimTypeLabel,
} from "../src/i18n/claim-labels";
import { formatMonthDay } from "../src/lib/date-utils";

assert.equal(getClaimTypeLabel(ClaimType.DELIVERY_DELAY), "Delivery delay");
assert.equal(
	getClaimTypeLabel(ClaimType.DELIVERY_DELAY, DEFAULT_LOCALE),
	"Delivery delay",
);
assert.equal(getClaimTypeLabel(ClaimType.OTHER), "Other");
assert.equal(getClaimPriorityLabel(ClaimPriority.URGENT), "Urgent");
assert.equal(
	getClaimPriorityLabel(ClaimPriority.URGENT, DEFAULT_LOCALE),
	"Urgent",
);
assert.equal(getClaimTypeLabel("UNRECOGNIZED"), "Unknown claim type");
assert.equal(getClaimPriorityLabel("UNRECOGNIZED"), "Unknown priority");
assert.equal(
	getClaimStatusLabel(ClaimStatus.AWAITING_INFO),
	"Awaiting information",
);
assert.equal(getClaimStatusLabel("UNRECOGNIZED"), "Unknown status");
assert.equal(formatMonthDay("2026-09-30T12:00:00.000Z"), "Sep 30");

console.log("Claim type, priority, and status catalog checks passed.");
