import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
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
import {
	UpdateAccessoryOperationDto,
	UpdateGoodDto,
	UpdateGoodsTypeDto,
	UpdateRejectionReasonDto,
	UpdateUnitDto,
} from "./requests/update-catalog.dto";

@Injectable()
export class CatalogMapper {
	toCreateUnit(dto: CreateUnitDto): UnitInsert {
		return {
			id: randomUUID(),
			name: dto.name,
		};
	}

	toUpdateUnit(dto: UpdateUnitDto) {
		return { name: dto.name.trim(), isActive: dto.isActive };
	}

	toCreateGoodsType(dto: CreateGoodsTypeDto): GoodsTypeInsert {
		return {
			id: randomUUID(),
			name: dto.name,
		};
	}

	toUpdateGoodsType(dto: UpdateGoodsTypeDto) {
		return { name: dto.name.trim(), isActive: dto.isActive };
	}

	toCreateGood(dto: CreateGoodDto): GoodInsert {
		return {
			name: dto.name,
			goodsCode: dto.goodsCode,
			goodsTypeId: dto.goodsTypeId,
		};
	}

	toUpdateGood(dto: UpdateGoodDto) {
		return {
			name: dto.name.trim(),
			goodsCode: dto.goodsCode.trim(),
			goodsTypeId: dto.goodsTypeId,
			isActive: dto.isActive,
		};
	}

	toCreateAccessoryOperation(
		dto: CreateAccessoryOperationDto,
	): AccessoryOperationInsert {
		return {
			id: randomUUID(),
			name: dto.name,
		};
	}

	toUpdateAccessoryOperation(dto: UpdateAccessoryOperationDto) {
		return { name: dto.name.trim(), isActive: dto.isActive };
	}

	toCreateRejectionReason(
		dto: CreateRejectionReasonDto,
	): RejectionReasonInsert {
		return {
			id: randomUUID(),
			name: dto.name,
		};
	}

	toUpdateRejectionReason(dto: UpdateRejectionReasonDto) {
		return { name: dto.name.trim(), isActive: dto.isActive };
	}
}
