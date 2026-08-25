import {
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
} from "src/database/reference-data";
import { NotificationInsert } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

export const toCreate = (dto: CreateNotificationDto): NotificationInsert => ({
	recipientUserId: dto.userId,
	typeId: NOTIFICATION_TYPES[dto.type].id,
	channelId: NOTIFICATION_CHANNELS[dto.channel].id,
	title: dto.title,
	message: dto.message,
	relatedEntityType: dto.relatedEntityType,
	relatedEntityId: dto.relatedEntityId,
	status: "PENDING",
});
