import { NotificationMessageCode } from "@ecommand/shared";
import type { NotificationListDto } from "@/lib/api/generated.schemas";

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
