import assert from "node:assert/strict";
import { NotificationMessageCode } from "@ecommand/shared";
import { getNotificationHref } from "../src/lib/notification-utils";

const notification = {
	messageCode: NotificationMessageCode.ORDER_STATUS_CHANGED,
	messageParameters: { recordCode: "ORD-ABCDEFGHJK", status: "SUBMITTED" },
	relatedEntityType: "orders",
	relatedEntityId: 17,
};

assert.equal(
	getNotificationHref(notification),
	"/dashboard/orders/ORD-ABCDEFGHJK",
	"notification links use public record codes rather than internal IDs",
);
assert.equal(
	getNotificationHref({
		...notification,
		messageParameters: {},
	}),
	null,
	"notifications without a public record code do not expose an internal ID",
);
assert.equal(
	getNotificationHref({
		...notification,
		relatedEntityType: "claims",
		messageParameters: { recordCode: "CLM-ABCDEFGHJK" },
	}),
	"/dashboard/claims/CLM-ABCDEFGHJK",
	"entity types select their corresponding detail route",
);

console.info("Notification route checks passed.");
