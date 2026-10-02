import {
	NotificationChannel,
	type NotificationMessage,
	NotificationMessageCode,
	NotificationType,
} from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import {
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
} from "@/database/reference-data";
import { NotificationInsert } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

@Injectable()
export class NotificationsMapper {
	toChange(
		recipientUserId: number,
		actorUserId: number,
		entity: "orders" | "programs" | "claims",
		entityId: number,
		content: NotificationMessage,
	): NotificationInsert | undefined {
		if (recipientUserId === actorUserId) return undefined;

		const types = {
			orders: NotificationType.ORDER_STATUS_CHANGE,
			programs: NotificationType.PROGRAM_PREVISIONNEL,
			claims: NotificationType.CLAIM_UPDATED,
		};
		return this.toCreate({
			userId: recipientUserId,
			type: types[entity],
			channel: NotificationChannel.IN_APP,
			messageCode: content.code as NotificationMessageCode,
			messageParameters: content.parameters,
			relatedEntityType: entity,
			relatedEntityId: entityId,
		});
	}

	toCreate(dto: CreateNotificationDto): NotificationInsert {
		return {
			recipientUserId: dto.userId,
			typeId: NOTIFICATION_TYPES[dto.type].id,
			channelId: NOTIFICATION_CHANNELS[dto.channel].id,
			messageCode: dto.messageCode,
			messageParameters: dto.messageParameters,
			relatedEntityType: dto.relatedEntityType,
			relatedEntityId: dto.relatedEntityId,
			status: dto.channel === NotificationChannel.IN_APP ? "SENT" : "PENDING",
			sentAt:
				dto.channel === NotificationChannel.IN_APP
					? new Date().toISOString()
					: null,
		};
	}
}
