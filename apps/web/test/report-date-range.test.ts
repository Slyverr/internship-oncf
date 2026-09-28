import assert from "node:assert/strict";
import { hasInvalidOrderReportDateRange } from "../src/lib/reports";

assert.equal(
	hasInvalidOrderReportDateRange("", ""),
	false,
	"an unbounded report range is valid",
);
assert.equal(
	hasInvalidOrderReportDateRange("2026-09-01", ""),
	false,
	"a start-only report range is valid",
);
assert.equal(
	hasInvalidOrderReportDateRange("", "2026-09-30"),
	false,
	"an end-only report range is valid",
);
assert.equal(
	hasInvalidOrderReportDateRange("2026-09-30", "2026-09-30"),
	false,
	"the same start and end date is valid",
);
assert.equal(
	hasInvalidOrderReportDateRange("2026-09-01", "2026-09-30"),
	false,
	"a chronological date range is valid",
);
assert.equal(
	hasInvalidOrderReportDateRange("2026-10-01", "2026-09-30"),
	true,
	"a start date after the end date is invalid",
);

console.log("Report date range checks passed.");
