import { Injectable } from "@nestjs/common";
import {
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
} from "@/database/reference-data";
import { NotificationInsert } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

@Injectable()
export class NotificationsMapper {
	toCreate(dto: CreateNotificationDto): NotificationInsert {
		return {
			recipientUserId: dto.userId,
			typeId: NOTIFICATION_TYPES[dto.type].id,
			channelId: NOTIFICATION_CHANNELS[dto.channel].id,
			title: dto.title,
			message: dto.message,
			relatedEntityType: dto.relatedEntityType,
			relatedEntityId: dto.relatedEntityId,
			status: "PENDING",
		};
	}
}
