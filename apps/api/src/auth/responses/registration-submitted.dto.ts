import { API_RESPONSE_CODES } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationSubmittedDto {
	@ApiProperty({ enum: [API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW] })
	code: typeof API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW;
}
