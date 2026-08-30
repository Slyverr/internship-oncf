import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@/database/drizzle.service";
import {
	toCreateAccessoryOperation,
	toCreateGood,
	toCreateGoodsType,
	toCreateRejectionReason,
	toCreateUnit,
} from "./catalog.mapper";
import {
	createAccessoryOperation,
	createGood,
	createGoodsType,
	createRejectionReason,
	createUnit,
	findAccessoryOperations,
	findGoods,
	findGoodsTypes,
	findRejectionReasons,
	findUnits,
} from "./catalog.query";
import {
	CreateAccessoryOperationDto,
	CreateGoodDto,
	CreateGoodsTypeDto,
	CreateRejectionReasonDto,
	CreateUnitDto,
} from "./requests/create-catalog.dto";

@Injectable()
export class CatalogService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAllUnits() {
		return findUnits(this.drizzle.db);
	}

	async createUnit(dto: CreateUnitDto) {
		return createUnit(this.drizzle.db, toCreateUnit(dto));
	}

	async findAllGoodsTypes() {
		return findGoodsTypes(this.drizzle.db);
	}

	async createGoodsType(dto: CreateGoodsTypeDto) {
		return createGoodsType(this.drizzle.db, toCreateGoodsType(dto));
	}

	async findAllGoods() {
		return findGoods(this.drizzle.db);
	}

	async createGood(dto: CreateGoodDto) {
		return createGood(this.drizzle.db, toCreateGood(dto));
	}

	async findAllAccessoryOperations() {
		return findAccessoryOperations(this.drizzle.db);
	}

	async createAccessoryOperation(dto: CreateAccessoryOperationDto) {
		return createAccessoryOperation(
			this.drizzle.db,
			toCreateAccessoryOperation(dto),
		);
	}

	async findAllRejectionReasons() {
		return findRejectionReasons(this.drizzle.db);
	}

	async createRejectionReason(dto: CreateRejectionReasonDto) {
		return createRejectionReason(this.drizzle.db, toCreateRejectionReason(dto));
	}
}
