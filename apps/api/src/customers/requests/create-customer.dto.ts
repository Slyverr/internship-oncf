import {
	IsBoolean,
	IsEmail,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class CreateCustomerDto {
	@IsString()
	@MaxLength(300)
	companyName: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	address?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	city?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	phone?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(100)
	email?: string;

	@IsOptional()
	@IsUUID()
	typeId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	customerCode?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
