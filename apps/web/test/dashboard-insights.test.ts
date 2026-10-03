import assert from "node:assert/strict";
import { RolePersona } from "@ecommand/shared";
import {
	getDashboardRegistrationCounts,
	getDashboardRoleCounts,
} from "../src/lib/dashboard-insights";

assert.deepEqual(
	getDashboardRoleCounts([
		{
			role: {
				id: "1",
				name: "Commercial agent",
				persona: RolePersona.AGENT_COMMERCIAL,
			},
		},
		{ role: { id: "2", name: "Administrator", persona: RolePersona.ADMIN } },
		{
			role: {
				id: "3",
				name: "Commercial agent",
				persona: RolePersona.AGENT_COMMERCIAL,
			},
		},
		{
			role: {
				id: "4",
				name: "Client representative",
				persona: RolePersona.CLIENT_REPRESENTATIVE,
			},
		},
	]),
	[
		{ name: "Commercial agent", count: 2 },
		{ name: "Administrator", count: 1 },
		{ name: "Client representative", count: 1 },
	],
);
assert.deepEqual(getDashboardRoleCounts([]), []);

assert.deepEqual(
	getDashboardRegistrationCounts(
		[
			{ createdAt: "2026-04-30T23:59:59.000Z" },
			{ createdAt: "2026-05-01T00:00:00.000Z" },
			{ createdAt: "2026-10-02T10:00:00.000Z" },
			{ createdAt: "2026-11-01T00:00:00.000Z" },
		],
		new Date("2026-10-02T12:00:00.000Z"),
	),
	[
		{ key: "2026-05", count: 1 },
		{ key: "2026-06", count: 0 },
		{ key: "2026-07", count: 0 },
		{ key: "2026-08", count: 0 },
		{ key: "2026-09", count: 0 },
		{ key: "2026-10", count: 1 },
	],
);

console.log("Dashboard account breakdown checks passed.");
