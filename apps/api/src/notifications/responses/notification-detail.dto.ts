import { Assert, Equals } from "src/common/utils/type-assertions";
import { NotificationDetail } from "../notifications.types";

type _Assertion = Assert<Equals<NotificationDetailDto, NotificationDetail>>;

export class NotificationDetailDto implements NotificationDetail {
	id: number;
	userId: number;
	typeId: number;
	channelId: number;
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
	user: { id: number; lastName: string; firstName: string } | null;
	notificationType: { id: number; name: string } | null;
	notificationChannel: { id: number; name: string } | null;
}
