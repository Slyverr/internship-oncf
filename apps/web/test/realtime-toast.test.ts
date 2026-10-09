import assert from "node:assert/strict";
import { NotificationMessageCode } from "@ecommand/shared";
import { getRealtimeToastPresentation } from "../src/lib/realtime/realtime-toast";

const notification = getRealtimeToastPresentation(
	{
		id: "notification-event-1",
		type: "notifications.changed",
		occurredAt: "2026-10-08T10:00:00.000Z",
		data: {
			change: "created",
			notification: {
				messageCode: NotificationMessageCode.ORDER_STATUS_CHANGED,
				messageParameters: {
					recordCode: "ORD-123",
					status: "IN_PROGRESS",
				},
				relatedEntityType: "orders",
				relatedEntityId: 12,
			},
		},
	},
	"en",
);
assert.deepEqual(notification, {
	type: "info",
	title: "Order status updated",
	description: "Order ORD-123 is now In progress.",
	href: "/dashboard/orders/ORD-123",
});

const dtmAccepted = getRealtimeToastPresentation(
	{
		id: "dtm-event-1",
		type: "notifications.changed",
		occurredAt: "2026-10-08T10:00:00.000Z",
		data: {
			change: "created",
			notification: {
				messageCode: NotificationMessageCode.DTM_RESPONSE,
				messageParameters: { recordCode: "PRG-456", status: "ACCEPTED" },
				relatedEntityType: "forecast_programs",
				relatedEntityId: 22,
			},
		},
	},
	"en",
);
assert.deepEqual(dtmAccepted, {
	type: "success",
	title: "DTM response received",
	description: "DTM response for PRG-456: accepted.",
	href: "/dashboard/programs/PRG-456",
});

assert.equal(
	getRealtimeToastPresentation(
		{
			id: "dtm-activity-event",
			type: "dtm.activity.changed",
			occurredAt: "2026-10-08T10:00:00.000Z",
			data: { requestId: 22, status: "ACCEPTED" },
		},
		"en",
	),
	null,
	"the manager activity refresh does not show a toast to every integration manager",
);

assert.equal(
	getRealtimeToastPresentation(
		{
			id: "dtm-pending-event",
			type: "dtm.activity.changed",
			occurredAt: "2026-10-08T10:00:00.000Z",
			data: { requestId: 23, status: "PENDING" },
		},
		"en",
	),
	null,
	"request submission stays quiet because the initiating form already confirms it",
);

assert.deepEqual(
	getRealtimeToastPresentation(
		{
			id: "dtm-request-pending-event",
			type: "dtm.request.pending",
			occurredAt: "2026-10-08T10:00:00.000Z",
			data: {
				requestId: 23,
				relatedEntityType: "orders",
				relatedEntityCode: "ORD-123",
			},
		},
		"en",
	),
	{
		type: "info",
		title: "New DTM request",
		description: "ORD-123 was sent to DTM and is ready for review.",
		href: "/dashboard/integrations/dtm",
	},
);

assert.equal(
	getRealtimeToastPresentation(
		{
			id: "notification-event-2",
			type: "notifications.changed",
			occurredAt: "2026-10-08T10:00:00.000Z",
			data: { change: "read" },
		},
		"en",
	),
	null,
	"read-state events update queries without showing a new-notification popup",
);

console.log("ecommand-web test: Realtime toast routing checks passed.");
