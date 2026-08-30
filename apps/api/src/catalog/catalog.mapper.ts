import {
	ACCESSORY_OPERATIONS_SCOPE,
	GOODS_TYPES_SCOPE,
	REJECTION_REASONS_SCOPE,
	UNITS_SCOPE,
} from "@/database/reference-data";
import { createReferenceId } from "@/database/reference-data/reference-data.utils";
import {
	AccessoryOperationInsert,
	GoodInsert,
	GoodsTypeInsert,
	RejectionReasonInsert,
	UnitInsert,
} from "./catalog.types";
import {
	CreateAccessoryOperationDto,
	CreateGoodDto,
	CreateGoodsTypeDto,
	CreateRejectionReasonDto,
	CreateUnitDto,
} from "./requests/create-catalog.dto";

export const toCreateUnit = (dto: CreateUnitDto): UnitInsert => ({
	id: createReferenceId(UNITS_SCOPE, dto.name),
	name: dto.name,
});

export const toCreateGoodsType = (
	dto: CreateGoodsTypeDto,
): GoodsTypeInsert => ({
	id: createReferenceId(GOODS_TYPES_SCOPE, dto.name),
	name: dto.name,
});

export const toCreateGood = (dto: CreateGoodDto): GoodInsert => ({
	name: dto.name,
	goodsCode: dto.goodsCode,
	goodsTypeId: dto.goodsTypeId,
});

export const toCreateAccessoryOperation = (
	dto: CreateAccessoryOperationDto,
): AccessoryOperationInsert => ({
	id: createReferenceId(ACCESSORY_OPERATIONS_SCOPE, dto.name),
	name: dto.name,
});

export const toCreateRejectionReason = (
	dto: CreateRejectionReasonDto,
): RejectionReasonInsert => ({
	id: createReferenceId(REJECTION_REASONS_SCOPE, dto.name),
	name: dto.name,
});
