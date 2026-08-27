import { Assert, Equals } from "@/common/utils/type-assertions";
import { NotificationList } from "../notifications.types";

type _Assertion = Assert<Equals<NotificationListDto, NotificationList>>;

export class NotificationListDto implements NotificationList {
	id: number;
	createdAt: string;
	typeId: string;
	recipientUserId: number;
	status: string;
	channelId: string;
	title: string;
	message: string;
	relatedEntityType: string | null;
	relatedEntityId: number | null;
	sentAt: string | null;
	readAt: string | null;
	retryCount: number | null;
	notificationType: { id: string; name: string } | null;
	notificationChannel: { id: string; name: string } | null;
}
