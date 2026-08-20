import { ProgramStatus } from "@ecommand/shared";
import { Transform, Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumberString,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateProgramDto {
	@IsInt()
	@Type(() => Number)
	@IsNotEmpty()
	orderId: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	userId?: number;

	@IsOptional()
	@Transform(({ value }) => value?.toUpperCase())
	@IsEnum(ProgramStatus)
	status?: ProgramStatus;

	@IsDateString()
	@IsNotEmpty()
	plannedDate: string;

	@IsNumberString()
	@IsNotEmpty()
	quantityPlanned: string;

	@IsOptional()
	@IsString()
	quantityRealized?: string;

	@IsOptional()
	@IsString()
	dtmStatus?: string;
}
