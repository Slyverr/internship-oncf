import {
	API_ERROR_CODES,
	API_VALIDATION_RULE_CODES,
	type ApiErrorCode,
	type ApiErrorDetails,
	type ApiValidationRuleCode,
} from "@ecommand/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiErrorDetailsDto implements ApiErrorDetails {
	@ApiPropertyOptional({
		type: "object",
		additionalProperties: {
			type: "array",
			items: {
				type: "string",
				enum: [...new Set(Object.values(API_VALIDATION_RULE_CODES))],
			},
		},
	})
	fields?: Record<string, ApiValidationRuleCode[]>;

	@ApiPropertyOptional({ type: [String] })
	permissions?: string[];
}

export class ApiErrorResponseDto {
	@ApiProperty({
		enum: [...new Set(Object.values(API_ERROR_CODES))],
		enumName: "ApiErrorCode",
	})
	code!: ApiErrorCode;

	@ApiProperty({ minimum: 400, maximum: 599 })
	statusCode!: number;

	@ApiPropertyOptional({ type: () => ApiErrorDetailsDto })
	details?: ApiErrorDetailsDto;
}
