import assert from "node:assert/strict";
import type { NotificationListDto } from "../src/lib/api/generated.schemas";
import { isUnreadClaimCommentNotification } from "../src/lib/claim-conversation-utils";

const notification: NotificationListDto = {
	id: 1,
	createdAt: "2026-09-28T12:00:00.000Z",
	typeId: "claim-updated",
	recipientUserId: 12,
	status: "SENT",
	channelId: "in-app",
	title: "Claim updated",
	message: "A new comment was added to claim #7.",
	relatedEntityType: "claims",
	relatedEntityId: 7,
	sentAt: "2026-09-28T12:00:00.000Z",
	readAt: null,
	retryCount: 0,
	notificationType: { id: "claim-updated", name: "CLAIM_UPDATED" },
	notificationChannel: { id: "in-app", name: "IN_APP" },
};

assert.equal(
	isUnreadClaimCommentNotification(notification, 7),
	true,
	"unread comments on the current claim show its new-message indicator",
);
assert.equal(
	isUnreadClaimCommentNotification(
		{ ...notification, readAt: "2026-09-28" },
		7,
	),
	false,
	"read comments do not show an unread indicator",
);
assert.equal(
	isUnreadClaimCommentNotification(notification, 8),
	false,
	"comments for another claim do not show this claim's indicator",
);
assert.equal(
	isUnreadClaimCommentNotification(
		{ ...notification, message: "Claim #7 is now resolved." },
		7,
	),
	false,
	"claim lifecycle notifications are not mistaken for conversation messages",
);

console.log("Claim conversation unread indicator checks passed.");
