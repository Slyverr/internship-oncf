import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { NotificationChannel, NotificationType } from "src/db/reference-data";

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
