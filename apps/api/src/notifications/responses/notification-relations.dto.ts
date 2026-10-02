import { ApiProperty } from "@nestjs/swagger";

export class NotificationRecipientDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	firstName: string;
}

export class NotificationTypeDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;
}

export class NotificationChannelDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;
}
