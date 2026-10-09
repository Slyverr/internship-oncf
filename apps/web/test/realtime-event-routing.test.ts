import assert from "node:assert/strict";
import {
	getAllRealtimeInvalidationKeys,
	getRealtimeInvalidationKeys,
} from "../src/lib/realtime/realtime-events";

assert.deepEqual(
	getRealtimeInvalidationKeys("notifications.changed"),
	[["/notifications"], ["/notifications/unread-count"]],
	"notification events refresh the inbox and unread badge",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("dtm.activity.changed"),
	[["/dtm/requests"]],
	"DTM events refresh the activity query",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("orders.changed", { code: "ORD-123" }),
	[
		["/orders"],
		["order-report"],
		["dashboard-order-activity"],
		["/orders/ORD-123"],
	],
	"order workflow events refresh lists, reports, dashboard activity, and active details",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("programs.changed", { code: "PRG-123" }),
	[["/programs"], ["/programs/PRG-123"]],
	"program workflow events refresh the program list and active detail",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("future.feature.changed"),
	[],
	"unregistered event types do not trigger unrelated data refreshes",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("realtime.resync"),
	getAllRealtimeInvalidationKeys(),
	"a recovered shared event connection refreshes every registered live query",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("customers.changed"),
	[["order-report"], ["dashboard-order-activity"]],
	"customer changes refresh customer-dependent order reports and dashboard activity",
);
assert.deepEqual(
	getRealtimeInvalidationKeys("catalog.changed"),
	[["active-reference-data"], ["managed-reference-data"]],
	"catalog changes refresh active and managed reference data",
);

console.log("ecommand-web test: Realtime event query routing checks passed.");
