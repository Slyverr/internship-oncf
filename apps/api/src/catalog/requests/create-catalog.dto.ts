import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateUnitDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}

export class CreateGoodsTypeDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}

export class CreateGoodDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	goodsCode: string;

	@IsUUID()
	goodsTypeId: string;
}

export class CreateAccessoryOperationDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}

export class CreateRejectionReasonDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}
