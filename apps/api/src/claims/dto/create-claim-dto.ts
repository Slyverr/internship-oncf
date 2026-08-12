import { ClaimPriority, ClaimStatus, ClaimType } from "@ecommand/shared";
import { Transform, Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateClaimDto {
	@IsInt()
	@Type(() => Number)
	@IsNotEmpty()
	customerId: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	userId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	orderId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	operationId?: number;

	@Transform(({ value }) => value?.toUpperCase())
	@IsEnum(ClaimType)
	type: ClaimType;

	@IsOptional()
	@Transform(({ value }) => value?.toUpperCase())
	@IsEnum(ClaimStatus)
	status?: ClaimStatus;

	@IsOptional()
	@Transform(({ value }) => value?.toLowerCase())
	@IsEnum(ClaimPriority)
	priority?: ClaimPriority;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	resolution?: string;
}
