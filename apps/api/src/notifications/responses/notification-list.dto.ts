import { Assert, Equals } from "@/common/utils/type-assertions";
import { NotificationList } from "../notifications.types";

type _Assertion = Assert<Equals<NotificationListDto, NotificationList>>;

export class NotificationListDto implements NotificationList {
	id: number;
	createdAt: string;
	typeId: number;
	recipientUserId: number;
	status: string;
	channelId: number;
	title: string;
	message: string;
	relatedEntityType: string | null;
	relatedEntityId: number | null;
	sentAt: string | null;
	readAt: string | null;
	retryCount: number | null;
	notificationType: { id: number; name: string } | null;
	notificationChannel: { id: number; name: string } | null;
}
