import {
	API_ERROR_CODES,
	ManagedReferenceResource,
	type ManagedReferenceResource as ManagedReferenceResourceType,
} from "@ecommand/shared";
import {
	BadRequestException,
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
	CreateManagedReferenceDataDto,
	UpdateManagedReferenceDataDto,
} from "./requests/managed-reference-data.dto";
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

	async findManagedReferenceData(resource: ManagedReferenceResourceType) {
		return this.catalogQuery.findManagedReferenceData(resource);
	}

	async findActiveReferenceData(resource: ManagedReferenceResourceType) {
		const rows = await this.catalogQuery.findManagedReferenceData(resource);
		return (rows ?? []).filter((row) => row.isActive);
	}

	async createManagedReferenceData(
		resource: ManagedReferenceResourceType,
		dto: CreateManagedReferenceDataDto,
	) {
		this.validateRequiredFields(resource, dto);
		await this.validateActiveParent(resource, dto);
		const created = await this.catalogQuery.createManagedReferenceData(
			resource,
			dto,
		);
		return this.ensure(created?.[0]);
	}

	async updateManagedReferenceData(
		resource: ManagedReferenceResourceType,
		id: number,
		dto: UpdateManagedReferenceDataDto,
	) {
		this.validateRequiredFields(resource, dto);
		await this.validateActiveParent(resource, dto);
		if (
			resource === ManagedReferenceResource.STATIONS &&
			!dto.isActive &&
			(await this.catalogQuery.hasActivePortsForStation(id))
		) {
			throw new ConflictException({ code: API_ERROR_CODES.CONFLICT });
		}
		if (
			resource === ManagedReferenceResource.PORTS &&
			!dto.isActive &&
			((await this.catalogQuery.hasActiveBerthsForPort(id)) ||
				(await this.catalogQuery.hasActiveLoadingLocationsForPort(id)))
		) {
			throw new ConflictException({ code: API_ERROR_CODES.CONFLICT });
		}
		const updated = await this.catalogQuery.updateManagedReferenceData(
			resource,
			id,
			dto,
		);
		return this.ensure(updated?.[0]);
	}

	private validateRequiredFields(
		resource: ManagedReferenceResourceType,
		dto: CreateManagedReferenceDataDto,
	) {
		const missingField =
			(resource === ManagedReferenceResource.STATIONS &&
				!dto.stationCode &&
				"stationCode") ||
			(resource === ManagedReferenceResource.PORTS && !dto.type && "type") ||
			(resource === ManagedReferenceResource.BERTHS && !dto.portId && "portId");
		if (!missingField) return;
		throw new BadRequestException({
			code: API_ERROR_CODES.VALIDATION_FAILED,
			details: { fields: { [missingField]: ["IS_NOT_EMPTY"] } },
		});
	}

	private async validateActiveParent(
		resource: ManagedReferenceResourceType,
		dto: CreateManagedReferenceDataDto,
	) {
		const parentIsActive =
			(resource === ManagedReferenceResource.PORTS &&
				dto.stationId != null &&
				(await this.catalogQuery.hasActiveStation(dto.stationId))) ||
			(resource === ManagedReferenceResource.BERTHS &&
				dto.portId != null &&
				(await this.catalogQuery.hasActivePort(dto.portId)));
		const requiresParent =
			(resource === ManagedReferenceResource.PORTS && dto.stationId != null) ||
			(resource === ManagedReferenceResource.BERTHS && dto.portId != null);
		if (requiresParent && !parentIsActive) {
			throw new ConflictException({ code: API_ERROR_CODES.CONFLICT });
		}
	}

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
