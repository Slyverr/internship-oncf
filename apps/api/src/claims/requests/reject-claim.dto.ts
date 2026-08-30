import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RejectClaimDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	rejectionReason: string;
}
