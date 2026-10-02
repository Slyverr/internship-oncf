import { NotificationMessageCode } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationList } from "../notifications.types";
import {
	NotificationChannelDto,
	NotificationTypeDto,
} from "./notification-relations.dto";

export class NotificationListDto implements NotificationList {
	@ApiProperty()
	id: number;
	@ApiProperty()
	createdAt: string;
	@ApiProperty()
	typeId: string;
	@ApiProperty()
	recipientUserId: number;
	@ApiProperty()
	status: string;
	@ApiProperty()
	channelId: string;
	@ApiProperty({
		enum: NotificationMessageCode,
		enumName: "NotificationMessageCode",
	})
	messageCode: NotificationMessageCode;
	@ApiProperty({ type: "object", additionalProperties: { type: "string" } })
	messageParameters: Record<string, string>;
	@ApiProperty({ nullable: true })
	relatedEntityType: string | null;
	@ApiProperty({ nullable: true })
	relatedEntityId: number | null;
	@ApiProperty({ nullable: true })
	sentAt: string | null;
	@ApiProperty({ nullable: true })
	readAt: string | null;
	@ApiProperty({ nullable: true })
	retryCount: number | null;
	@ApiProperty({ type: () => NotificationTypeDto, nullable: true })
	notificationType: NotificationTypeDto | null;
	@ApiProperty({ type: () => NotificationChannelDto, nullable: true })
	notificationChannel: NotificationChannelDto | null;
}
