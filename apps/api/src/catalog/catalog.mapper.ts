import { Injectable } from "@nestjs/common";
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

@Injectable()
export class CatalogMapper {
	toCreateUnit(dto: CreateUnitDto): UnitInsert {
		return {
			id: createReferenceId(UNITS_SCOPE, dto.name),
			name: dto.name,
		};
	}

	toCreateGoodsType(dto: CreateGoodsTypeDto): GoodsTypeInsert {
		return {
			id: createReferenceId(GOODS_TYPES_SCOPE, dto.name),
			name: dto.name,
		};
	}

	toCreateGood(dto: CreateGoodDto): GoodInsert {
		return {
			name: dto.name,
			goodsCode: dto.goodsCode,
			goodsTypeId: dto.goodsTypeId,
		};
	}

	toCreateAccessoryOperation(
		dto: CreateAccessoryOperationDto,
	): AccessoryOperationInsert {
		return {
			id: createReferenceId(ACCESSORY_OPERATIONS_SCOPE, dto.name),
			name: dto.name,
		};
	}

	toCreateRejectionReason(
		dto: CreateRejectionReasonDto,
	): RejectionReasonInsert {
		return {
			id: createReferenceId(REJECTION_REASONS_SCOPE, dto.name),
			name: dto.name,
		};
	}
}
