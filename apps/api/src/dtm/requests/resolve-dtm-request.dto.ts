import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export const DTM_SIMULATION_RESULTS = ["ACCEPTED", "REJECTED"] as const;

export class ResolveDtmRequestDto {
	@ApiProperty({ enum: DTM_SIMULATION_RESULTS })
	@IsIn(DTM_SIMULATION_RESULTS)
	result!: (typeof DTM_SIMULATION_RESULTS)[number];
}
