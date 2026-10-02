import {
	CUSTOMER_ICE_PATTERN,
	STRONG_PASSWORD_MAX_LENGTH,
	STRONG_PASSWORD_PATTERN,
} from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from "class-validator";

export class RegisterClientDto {
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim().toLowerCase() : value,
	)
	@IsEmail()
	@MaxLength(100)
	email: string;

	@IsString()
	@Matches(STRONG_PASSWORD_PATTERN)
	@MaxLength(STRONG_PASSWORD_MAX_LENGTH)
	password: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(100)
	firstName: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(100)
	lastName: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(50)
	customerCode: string;

	@IsString()
	@Matches(CUSTOMER_ICE_PATTERN)
	@ApiProperty({ pattern: CUSTOMER_ICE_PATTERN.source })
	ice: string;
}
