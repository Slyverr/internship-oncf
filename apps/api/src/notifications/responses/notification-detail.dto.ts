import { Assert, Equals } from "@/common/utils/type-assertions";
import { NotificationDetail } from "../notifications.types";

type _Assertion = Assert<Equals<NotificationDetailDto, NotificationDetail>>;

export class NotificationDetailDto implements NotificationDetail {
	id: number;
	recipientUserId: number;
	typeId: string;
	channelId: string;
	title: string;
	message: string;
	relatedEntityType: string | null;
	relatedEntityId: number | null;
	status: string;
	sentAt: string | null;
	readAt: string | null;
	errorMessage: string | null;
	retryCount: number | null;
	createdAt: string;
	recipientUser: { id: number; lastName: string; firstName: string } | null;
	notificationType: { id: string; name: string } | null;
	notificationChannel: { id: string; name: string } | null;
}
