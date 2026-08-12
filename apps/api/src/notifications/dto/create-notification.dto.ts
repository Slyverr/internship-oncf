import { NotificationChannel, NotificationType } from "@ecommand/shared";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
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

	@IsString()
	@MaxLength(200)
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	message: string;

	@IsOptional()
	@IsString()
	relatedEntityType?: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	relatedEntityId?: number;
}
