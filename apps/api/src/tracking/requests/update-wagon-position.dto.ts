import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateWagonPositionDto {
	@IsNumber()
	@Type(() => Number)
	@IsNotEmpty()
	latitude: number;

	@IsNumber()
	@Type(() => Number)
	@IsNotEmpty()
	longitude: number;

	@IsOptional()
	@IsString()
	status?: string;
}
