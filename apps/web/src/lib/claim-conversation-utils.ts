import type { NotificationListDto } from "@/lib/api/generated.schemas";

export function isUnreadClaimCommentNotification(
	notification: NotificationListDto,
	claimId: number,
) {
	return (
		!notification.readAt &&
		notification.relatedEntityType === "claims" &&
		notification.relatedEntityId === claimId &&
		notification.message.startsWith("A new comment was added to claim #")
	);
}
