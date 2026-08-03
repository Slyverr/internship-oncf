import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProgramDto {
	@IsNumber()
	@IsOptional()
	orderId?: number;

	@IsString()
	@IsOptional()
	plannedDate?: string;

	@IsString()
	@IsOptional()
	quantityPlanned?: string;

	@IsString()
	@IsOptional()
	quantityRealized?: string;

	@IsString()
	@IsOptional()
	dtmStatus?: string;

	@IsNumber()
	@IsOptional()
	statusId?: number;
}
