import { API_ERROR_CODES } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CatalogMapper } from "./catalog.mapper";
import { CatalogQuery } from "./catalog.query";
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
export class CatalogService {
	constructor(
		private readonly catalogQuery: CatalogQuery,
		private readonly catalogMapper: CatalogMapper,
	) {}

	async findAllUnits() {
		return this.catalogQuery.findUnits();
	}

	async findAllCustomerTypes() {
		return this.catalogQuery.findCustomerTypes();
	}

	async findManageUnits() {
		return this.catalogQuery.findManageUnits();
	}

	async createUnit(dto: CreateUnitDto) {
		const values = this.catalogMapper.toCreateUnit(dto);
		return this.catalogQuery.createUnit(values);
	}

	async updateUnit(id: string, dto: UpdateUnitDto) {
		return this.ensure(
			await this.catalogQuery.updateUnit(
				id,
				this.catalogMapper.toUpdateUnit(dto),
			),
		);
	}

	async findAllGoodsTypes() {
		return this.catalogQuery.findGoodsTypes();
	}

	async findManageGoodsTypes() {
		return this.catalogQuery.findManageGoodsTypes();
	}

	async createGoodsType(dto: CreateGoodsTypeDto) {
		const values = this.catalogMapper.toCreateGoodsType(dto);
		return this.catalogQuery.createGoodsType(values);
	}

	async updateGoodsType(id: string, dto: UpdateGoodsTypeDto) {
		if (!dto.isActive && (await this.catalogQuery.hasActiveGoodsForType(id))) {
			throw new ConflictException({
				code: API_ERROR_CODES.CATALOG_GOODS_TYPE_HAS_ACTIVE_GOODS,
			});
		}
		return this.ensure(
			await this.catalogQuery.updateGoodsType(
				id,
				this.catalogMapper.toUpdateGoodsType(dto),
			),
		);
	}

	async findAllGoods() {
		return this.catalogQuery.findGoods();
	}

	async findManageGoods() {
		return this.catalogQuery.findManageGoods();
	}

	async createGood(dto: CreateGoodDto) {
		if (!(await this.catalogQuery.isActiveGoodsType(dto.goodsTypeId))) {
			throw new ConflictException({
				code: API_ERROR_CODES.CATALOG_GOODS_TYPE_INACTIVE,
			});
		}
		const values = this.catalogMapper.toCreateGood(dto);
		return this.catalogQuery.createGood(values);
	}

	async updateGood(id: number, dto: UpdateGoodDto) {
		if (
			dto.isActive &&
			!(await this.catalogQuery.isActiveGoodsType(dto.goodsTypeId))
		) {
			throw new ConflictException({
				code: API_ERROR_CODES.CATALOG_GOODS_TYPE_INACTIVE,
			});
		}
		return this.ensure(
			await this.catalogQuery.updateGood(
				id,
				this.catalogMapper.toUpdateGood(dto),
			),
		);
	}

	async findAllAccessoryOperations() {
		return this.catalogQuery.findAccessoryOperations();
	}

	async findManageAccessoryOperations() {
		return this.catalogQuery.findManageAccessoryOperations();
	}

	async createAccessoryOperation(dto: CreateAccessoryOperationDto) {
		const values = this.catalogMapper.toCreateAccessoryOperation(dto);
		return this.catalogQuery.createAccessoryOperation(values);
	}

	async updateAccessoryOperation(id: string, dto: UpdateAccessoryOperationDto) {
		return this.ensure(
			await this.catalogQuery.updateAccessoryOperation(
				id,
				this.catalogMapper.toUpdateAccessoryOperation(dto),
			),
		);
	}

	async findAllRejectionReasons() {
		return this.catalogQuery.findRejectionReasons();
	}

	async findManageRejectionReasons() {
		return this.catalogQuery.findManageRejectionReasons();
	}

	async createRejectionReason(dto: CreateRejectionReasonDto) {
		const values = this.catalogMapper.toCreateRejectionReason(dto);
		return this.catalogQuery.createRejectionReason(values);
	}

	async updateRejectionReason(id: string, dto: UpdateRejectionReasonDto) {
		return this.ensure(
			await this.catalogQuery.updateRejectionReason(
				id,
				this.catalogMapper.toUpdateRejectionReason(dto),
			),
		);
	}

	private ensure<T>(value: T | undefined): T {
		if (!value) {
			throw new NotFoundException({ code: API_ERROR_CODES.RESOURCE_NOT_FOUND });
		}
		return value;
	}
}
