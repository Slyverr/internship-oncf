import { CLAIM_REJECTION_REASON_MAX_LENGTH } from "@ecommand/shared";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RejectClaimDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(CLAIM_REJECTION_REASON_MAX_LENGTH)
	rejectionReason: string;
}
