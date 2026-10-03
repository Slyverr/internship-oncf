import { NotificationMessageCode } from "@ecommand/shared";
import type { NotificationListDto } from "@/lib/api/generated.schemas";

export type ConversationScrollAction = "follow-latest" | "show-new" | "none";

export function getConversationScrollAction({
	positionedAtLatest,
	scrollAfterReply,
	nearLatest,
	previousMessageCount,
	nextMessageCount,
}: {
	positionedAtLatest: boolean;
	scrollAfterReply: boolean;
	nearLatest: boolean;
	previousMessageCount: number;
	nextMessageCount: number;
}): ConversationScrollAction {
	if (!positionedAtLatest || scrollAfterReply || nearLatest) {
		return "follow-latest";
	}
	if (nextMessageCount > previousMessageCount) return "show-new";
	return "none";
}

export function isUnreadClaimCommentNotification(
	notification: NotificationListDto,
	claimId: number,
) {
	return (
		!notification.readAt &&
		notification.relatedEntityType === "claims" &&
		notification.relatedEntityId === claimId &&
		notification.messageCode === NotificationMessageCode.CLAIM_COMMENT_ADDED
	);
}
