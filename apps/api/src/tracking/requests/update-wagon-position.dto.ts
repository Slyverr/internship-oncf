import { Type } from "class-transformer";
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class UpdateWagonPositionDto {
	@IsNumber()
	@Type(() => Number)
	@IsNotEmpty()
	@Min(-90)
	@Max(90)
	latitude: number;

	@IsNumber()
	@Type(() => Number)
	@IsNotEmpty()
	@Min(-180)
	@Max(180)
	longitude: number;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsDateString()
	recordedAt?: string;
}
