import { formatEnumLabel } from "../src/lib/enum-labels";

const cases = [
	["DRAFT", "Draft"],
	["PARTIALLY_EXECUTED", "Partially Executed"],
	["SENT_TO_DTM", "Sent to DTM"],
	["NON_COMPLIANT_QUALITY", "Non Compliant Quality"],
	["low", "Low"],
	["", "—"],
	[undefined, "—"],
] as const;

for (const [value, expected] of cases) {
	if (formatEnumLabel(value) !== expected) {
		throw new Error(`Expected ${String(value)} to format as ${expected}`);
	}
}

console.log("Enum label checks passed.");
