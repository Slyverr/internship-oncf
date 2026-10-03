import assert from "node:assert/strict";
import { NotificationMessageCode } from "@ecommand/shared";
import type { NotificationListDto } from "../src/lib/api/generated.schemas";
import {
	getConversationScrollAction,
	isUnreadClaimCommentNotification,
} from "../src/lib/claim-conversation-utils";

const notification: NotificationListDto = {
	id: 1,
	createdAt: "2026-09-28T12:00:00.000Z",
	typeId: "claim-updated",
	recipientUserId: 12,
	status: "SENT",
	channelId: "in-app",
	messageCode: NotificationMessageCode.CLAIM_COMMENT_ADDED,
	messageParameters: { recordCode: "CLM-ABCDEFGHJK" },
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
		{
			...notification,
			messageCode: NotificationMessageCode.CLAIM_STATUS_CHANGED,
		},
		7,
	),
	false,
	"claim lifecycle notifications are not mistaken for conversation messages",
);

assert.equal(
	getConversationScrollAction({
		positionedAtLatest: false,
		scrollAfterReply: false,
		nearLatest: false,
		previousMessageCount: 0,
		nextMessageCount: 4,
	}),
	"follow-latest",
	"initial conversation load opens at the newest message",
);
assert.equal(
	getConversationScrollAction({
		positionedAtLatest: true,
		scrollAfterReply: false,
		nearLatest: true,
		previousMessageCount: 4,
		nextMessageCount: 5,
	}),
	"follow-latest",
	"incoming messages keep the reader at the newest message when already near it",
);
assert.equal(
	getConversationScrollAction({
		positionedAtLatest: true,
		scrollAfterReply: false,
		nearLatest: false,
		previousMessageCount: 4,
		nextMessageCount: 5,
	}),
	"show-new",
	"incoming messages notify the reader without moving them away from older messages",
);
assert.equal(
	getConversationScrollAction({
		positionedAtLatest: true,
		scrollAfterReply: false,
		nearLatest: false,
		previousMessageCount: 4,
		nextMessageCount: 4,
	}),
	"none",
	"background refreshes do not scroll or show a new-message action without new messages",
);

console.log("Claim conversation update behavior checks passed.");
