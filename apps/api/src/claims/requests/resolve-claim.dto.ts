import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ResolveClaimDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	resolution: string;
}
