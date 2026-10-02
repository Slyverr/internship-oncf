import { NotificationMessageCode } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationDetail } from "../notifications.types";
import {
	NotificationChannelDto,
	NotificationRecipientDto,
	NotificationTypeDto,
} from "./notification-relations.dto";

export class NotificationDetailDto implements NotificationDetail {
	@ApiProperty()
	id: number;
	@ApiProperty()
	recipientUserId: number;
	@ApiProperty()
	typeId: string;
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
	@ApiProperty()
	status: string;
	@ApiProperty({ nullable: true })
	sentAt: string | null;
	@ApiProperty({ nullable: true })
	readAt: string | null;
	@ApiProperty({ nullable: true })
	retryCount: number | null;
	@ApiProperty()
	createdAt: string;
	@ApiProperty({ type: () => NotificationRecipientDto, nullable: true })
	recipientUser: NotificationRecipientDto | null;
	@ApiProperty({ type: () => NotificationTypeDto, nullable: true })
	notificationType: NotificationTypeDto | null;
	@ApiProperty({ type: () => NotificationChannelDto, nullable: true })
	notificationChannel: NotificationChannelDto | null;
}
