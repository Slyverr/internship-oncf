import { CLAIM_RESOLUTION_MAX_LENGTH } from "@ecommand/shared";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ResolveClaimDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(CLAIM_RESOLUTION_MAX_LENGTH)
	resolution: string;
}
