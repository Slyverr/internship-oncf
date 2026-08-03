import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProgramDto {
	@IsNumber()
	@IsNotEmpty()
	orderId: number;

	@IsString()
	@IsNotEmpty()
	plannedDate: string;

	@IsString()
	@IsNotEmpty()
	quantityPlanned: string;

	@IsString()
	@IsOptional()
	quantityRealized?: string;

	@IsString()
	@IsOptional()
	dtmStatus?: string;
}
