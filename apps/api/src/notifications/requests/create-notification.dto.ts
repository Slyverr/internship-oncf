import {
	NotificationChannel,
	NotificationMessageCode,
	NotificationType,
} from "@ecommand/shared";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateNotificationDto {
	@IsInt()
	@Type(() => Number)
	@IsNotEmpty()
	userId: number;

	@IsEnum(NotificationType)
	type: NotificationType;

	@IsEnum(NotificationChannel)
	channel: NotificationChannel;

	@IsEnum(NotificationMessageCode)
	messageCode: NotificationMessageCode;

	@IsObject()
	messageParameters: Record<string, string>;

	@IsOptional()
	@IsString()
	relatedEntityType?: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	relatedEntityId?: number;
}
