import {
	API_ERROR_CODES,
	ManagedReferenceResource,
	type ManagedReferenceResource as ManagedReferenceResourceType,
	Permission,
} from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	Optional,
} from "@nestjs/common";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
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
		@Optional() private readonly realtimeEvents?: RealtimeEventsService,
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
		const result = this.ensure(created?.[0]);
		this.publishChanged();
		return result;
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
		const result = this.ensure(updated?.[0]);
		this.publishChanged();
		return result;
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
		const result = await this.catalogQuery.createUnit(values);
		this.publishChanged();
		return result;
	}

	async updateUnit(id: string, dto: UpdateUnitDto) {
		const result = this.ensure(
			await this.catalogQuery.updateUnit(
				id,
				this.catalogMapper.toUpdateUnit(dto),
			),
		);
		this.publishChanged();
		return result;
	}

	async findAllGoodsTypes() {
		return this.catalogQuery.findGoodsTypes();
	}

	async findManageGoodsTypes() {
		return this.catalogQuery.findManageGoodsTypes();
	}

	async createGoodsType(dto: CreateGoodsTypeDto) {
		const values = this.catalogMapper.toCreateGoodsType(dto);
		const result = await this.catalogQuery.createGoodsType(values);
		this.publishChanged();
		return result;
	}

	async updateGoodsType(id: string, dto: UpdateGoodsTypeDto) {
		if (!dto.isActive && (await this.catalogQuery.hasActiveGoodsForType(id))) {
			throw new ConflictException({
				code: API_ERROR_CODES.CATALOG_GOODS_TYPE_HAS_ACTIVE_GOODS,
			});
		}
		const result = this.ensure(
			await this.catalogQuery.updateGoodsType(
				id,
				this.catalogMapper.toUpdateGoodsType(dto),
			),
		);
		this.publishChanged();
		return result;
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
		const result = await this.catalogQuery.createGood(values);
		this.publishChanged();
		return result;
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
		const result = this.ensure(
			await this.catalogQuery.updateGood(
				id,
				this.catalogMapper.toUpdateGood(dto),
			),
		);
		this.publishChanged();
		return result;
	}

	async findAllAccessoryOperations() {
		return this.catalogQuery.findAccessoryOperations();
	}

	async findManageAccessoryOperations() {
		return this.catalogQuery.findManageAccessoryOperations();
	}

	async createAccessoryOperation(dto: CreateAccessoryOperationDto) {
		const values = this.catalogMapper.toCreateAccessoryOperation(dto);
		const result = await this.catalogQuery.createAccessoryOperation(values);
		this.publishChanged();
		return result;
	}

	async updateAccessoryOperation(id: string, dto: UpdateAccessoryOperationDto) {
		const result = this.ensure(
			await this.catalogQuery.updateAccessoryOperation(
				id,
				this.catalogMapper.toUpdateAccessoryOperation(dto),
			),
		);
		this.publishChanged();
		return result;
	}

	async findAllRejectionReasons() {
		return this.catalogQuery.findRejectionReasons();
	}

	async findManageRejectionReasons() {
		return this.catalogQuery.findManageRejectionReasons();
	}

	async createRejectionReason(dto: CreateRejectionReasonDto) {
		const values = this.catalogMapper.toCreateRejectionReason(dto);
		const result = await this.catalogQuery.createRejectionReason(values);
		this.publishChanged();
		return result;
	}

	async updateRejectionReason(id: string, dto: UpdateRejectionReasonDto) {
		const result = this.ensure(
			await this.catalogQuery.updateRejectionReason(
				id,
				this.catalogMapper.toUpdateRejectionReason(dto),
			),
		);
		this.publishChanged();
		return result;
	}

	private publishChanged() {
		this.realtimeEvents?.publishToPermission(
			Permission.CATALOG_READ,
			REALTIME_EVENT_TYPES.catalogChanged,
		);
	}

	private ensure<T>(value: T | undefined): T {
		if (!value) {
			throw new NotFoundException({ code: API_ERROR_CODES.RESOURCE_NOT_FOUND });
		}
		return value;
	}
}
