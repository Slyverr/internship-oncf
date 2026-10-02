import { API_RESPONSE_CODES, type ApiResponseCode } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class SuccessResponseDto {
	@ApiProperty({ enum: Object.values(API_RESPONSE_CODES) })
	code: ApiResponseCode;
}
