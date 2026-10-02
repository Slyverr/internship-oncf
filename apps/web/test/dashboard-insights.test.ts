import assert from "node:assert/strict";
import { getDashboardRoleCounts } from "../src/lib/dashboard-insights";

assert.deepEqual(
	getDashboardRoleCounts([
		{ role: { id: "1", name: "Commercial agent" } },
		{ role: { id: "2", name: "Administrator" } },
		{ role: { id: "3", name: "Commercial agent" } },
		{ role: { id: "4", name: "Client representative" } },
	]),
	[
		{ name: "Commercial agent", count: 2 },
		{ name: "Administrator", count: 1 },
		{ name: "Client representative", count: 1 },
	],
);
assert.deepEqual(getDashboardRoleCounts([]), []);

console.log("Dashboard account breakdown checks passed.");
