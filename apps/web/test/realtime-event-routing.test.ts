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
	[["/orders"], ["/orders/ORD-123"]],
	"order workflow events refresh the agent list and active order detail",
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
assert.equal(
	getRealtimeInvalidationKeys("realtime.resync").length,
	5,
	"a recovered shared event connection refreshes every registered live query",
);
assert.equal(
	getAllRealtimeInvalidationKeys().length,
	5,
	"reconnection refreshes each currently registered live query",
);

console.log("ecommand-web test: Realtime event query routing checks passed.");
