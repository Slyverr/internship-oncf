import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DtmRequestDto {
	@ApiProperty()
	id!: number;

	@ApiProperty()
	requestType!: string;

	@ApiProperty({ enum: ["PENDING", "SUCCESS", "FAILED", "TIMEOUT"] })
	status!: string;

	@ApiProperty()
	createdAt!: string;

	@ApiPropertyOptional({
		nullable: true,
		description: "Timestamp when the DTM response was recorded",
	})
	respondedAt!: string | null;

	@ApiPropertyOptional({ nullable: true })
	relatedEntityType!: string | null;

	@ApiPropertyOptional({ nullable: true })
	relatedEntityId!: number | null;

	@ApiPropertyOptional({ nullable: true })
	relatedEntityCode!: string | null;

	@ApiPropertyOptional({ nullable: true })
	httpStatusCode!: number | null;

	@ApiPropertyOptional({ nullable: true })
	errorDetails!: string | null;

	@ApiPropertyOptional({
		nullable: true,
		description:
			"Elapsed time rounded to whole seconds and derived from request and response timestamps",
	})
	durationSeconds!: number | null;

	@ApiPropertyOptional({ nullable: true })
	requestPayload!: string | null;

	@ApiPropertyOptional({ nullable: true })
	responsePayload!: string | null;
}

export class DtmOperationsDto {
	@ApiProperty({ enum: ["SIMULATOR", "DISABLED"] })
	mode!: "SIMULATOR" | "DISABLED";

	@ApiPropertyOptional({ enum: ["MANUAL", "AUTO"], nullable: true })
	responseMode!: "MANUAL" | "AUTO" | null;

	@ApiProperty({ type: [DtmRequestDto] })
	requests!: DtmRequestDto[];
}

export class DtmRequestResolutionDto {
	@ApiProperty()
	id!: number;

	@ApiProperty({ enum: ["ACCEPTED", "REJECTED"] })
	result!: "ACCEPTED" | "REJECTED";

	@ApiProperty({ enum: ["SUCCESS", "FAILED"] })
	status!: "SUCCESS" | "FAILED";
}
