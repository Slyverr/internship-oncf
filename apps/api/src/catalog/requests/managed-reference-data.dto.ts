import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsEmail,
	IsIn,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from "class-validator";

export class CreateManagedReferenceDataDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name: string;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(50)
	stationCode?: string | null;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(500)
	address?: string | null;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(100)
	city?: string | null;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsString()
	@MaxLength(20)
	phone?: string | null;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || null : value,
	)
	@IsEmail()
	@MaxLength(100)
	email?: string | null;

	@IsOptional()
	@IsIn(["normal", "dry"])
	type?: "normal" | "dry";

	@IsOptional()
	@Transform(({ value }) =>
		value == null || value === "" ? value : Number(value),
	)
	@IsInt()
	@Min(1)
	stationId?: number | null;

	@IsOptional()
	@Transform(({ value }) =>
		value == null || value === "" ? value : Number(value),
	)
	@IsInt()
	@Min(1)
	portId?: number;
}

export class UpdateManagedReferenceDataDto extends CreateManagedReferenceDataDto {
	@IsBoolean()
	isActive: boolean;
}
