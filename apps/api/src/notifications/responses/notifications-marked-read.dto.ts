import { API_RESPONSE_CODES } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationsMarkedReadDto {
	@ApiProperty({ enum: [API_RESPONSE_CODES.NOTIFICATIONS_MARKED_READ] })
	code: typeof API_RESPONSE_CODES.NOTIFICATIONS_MARKED_READ;

	@ApiProperty()
	count: number;
}
