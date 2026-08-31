import { Injectable } from "@nestjs/common";
import { CatalogMapper } from "./catalog.mapper";
import { CatalogQuery } from "./catalog.query";
import {
	CreateAccessoryOperationDto,
	CreateGoodDto,
	CreateGoodsTypeDto,
	CreateRejectionReasonDto,
	CreateUnitDto,
} from "./requests/create-catalog.dto";

@Injectable()
export class CatalogService {
	constructor(
		private readonly catalogQuery: CatalogQuery,
		private readonly catalogMapper: CatalogMapper,
	) {}

	async findAllUnits() {
		return this.catalogQuery.findUnits();
	}

	async createUnit(dto: CreateUnitDto) {
		const values = this.catalogMapper.toCreateUnit(dto);
		return this.catalogQuery.createUnit(values);
	}

	async findAllGoodsTypes() {
		return this.catalogQuery.findGoodsTypes();
	}

	async createGoodsType(dto: CreateGoodsTypeDto) {
		const values = this.catalogMapper.toCreateGoodsType(dto);
		return this.catalogQuery.createGoodsType(values);
	}

	async findAllGoods() {
		return this.catalogQuery.findGoods();
	}

	async createGood(dto: CreateGoodDto) {
		const values = this.catalogMapper.toCreateGood(dto);
		return this.catalogQuery.createGood(values);
	}

	async findAllAccessoryOperations() {
		return this.catalogQuery.findAccessoryOperations();
	}

	async createAccessoryOperation(dto: CreateAccessoryOperationDto) {
		const values = this.catalogMapper.toCreateAccessoryOperation(dto);
		return this.catalogQuery.createAccessoryOperation(values);
	}

	async findAllRejectionReasons() {
		return this.catalogQuery.findRejectionReasons();
	}

	async createRejectionReason(dto: CreateRejectionReasonDto) {
		const values = this.catalogMapper.toCreateRejectionReason(dto);
		return this.catalogQuery.createRejectionReason(values);
	}
}
