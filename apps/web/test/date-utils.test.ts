import assert from "node:assert/strict";
import {
	DEFAULT_LOCALE,
	formatDisplayDate,
	formatDisplayDateTime,
	formatFullMessageTime,
	formatMediumDate,
	formatMessageTime,
	formatMonthLabel,
	formatMonthYear,
	formatRelativeTime,
} from "../src/lib/date-utils";

const sampleDate = new Date("2026-09-30T14:05:00.000Z");

assert.equal(DEFAULT_LOCALE, "en");
assert.equal(formatDisplayDate(null), "—");
assert.equal(formatDisplayDate(undefined), "—");
assert.equal(
	formatDisplayDate(sampleDate.toISOString()),
	sampleDate.toLocaleDateString(DEFAULT_LOCALE),
);
assert.equal(
	formatDisplayDateTime(sampleDate.toISOString()),
	sampleDate.toLocaleString(DEFAULT_LOCALE),
);
assert.equal(
	formatMediumDate(sampleDate.toISOString()),
	new Intl.DateTimeFormat(DEFAULT_LOCALE, { dateStyle: "medium" }).format(
		sampleDate,
	),
);
assert.equal(
	formatMessageTime(sampleDate),
	new Intl.DateTimeFormat(DEFAULT_LOCALE, {
		hour: "numeric",
		minute: "2-digit",
	}).format(sampleDate),
);
assert.equal(
	formatFullMessageTime(sampleDate),
	new Intl.DateTimeFormat(DEFAULT_LOCALE, {
		dateStyle: "full",
		timeStyle: "short",
	}).format(sampleDate),
);
assert.equal(formatMonthLabel(sampleDate), "Sep");
assert.equal(formatMonthYear("2026-09"), "Sep 2026");
assert.equal(formatMonthYear("2026-13"), "—");
assert.equal(
	formatRelativeTime(new Date(Date.now() - 5 * 60_000)),
	"5 minutes ago",
);

const originalTimeZone = process.env.TZ;
process.env.TZ = "America/Los_Angeles";
try {
	const dateOnly = "2026-01-01";
	const expectedDateOnly = new Date(`${dateOnly}T00:00:00.000Z`);
	assert.equal(
		formatDisplayDate(dateOnly),
		new Intl.DateTimeFormat(DEFAULT_LOCALE, { timeZone: "UTC" }).format(
			expectedDateOnly,
		),
	);
	assert.equal(
		formatMediumDate(dateOnly),
		new Intl.DateTimeFormat(DEFAULT_LOCALE, {
			dateStyle: "medium",
			timeZone: "UTC",
		}).format(expectedDateOnly),
	);
} finally {
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
}

console.log("Date and time locale checks passed.");
