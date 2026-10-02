import { API_RESPONSE_CODES } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationsMarkedReadDto {
	@ApiProperty({ enum: [API_RESPONSE_CODES.NOTIFICATIONS_MARKED_READ] })
	code: string;

	@ApiProperty()
	count: number;
}
