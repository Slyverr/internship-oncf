import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsNotEmpty,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class UpdateUnitDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name: string;

	@IsBoolean()
	isActive: boolean;
}

export class UpdateGoodsTypeDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsBoolean()
	isActive: boolean;
}

export class UpdateGoodDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	goodsCode: string;

	@IsUUID()
	goodsTypeId: string;

	@IsBoolean()
	isActive: boolean;
}

export class UpdateAccessoryOperationDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name: string;

	@IsBoolean()
	isActive: boolean;
}

export class UpdateRejectionReasonDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(300)
	name: string;

	@IsBoolean()
	isActive: boolean;
}
