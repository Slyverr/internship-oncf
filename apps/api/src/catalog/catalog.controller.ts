import { Permission } from "@ecommand/shared";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { CatalogService } from "./catalog.service";
import {
	CreateAccessoryOperationDto,
	CreateGoodDto,
	CreateGoodsTypeDto,
	CreateRejectionReasonDto,
	CreateUnitDto,
} from "./requests/create-catalog.dto";
import {
	AccessoryOperationDto,
	GoodDto,
	GoodsTypeDto,
	RejectionReasonDto,
	UnitDto,
} from "./responses/catalog.dto";

const { list: UnitListResponse, create: UnitCreateResponse } =
	createCrudResponses({
		list: UnitDto,
		detail: UnitDto,
	});

const { list: GoodsTypeListResponse, create: GoodsTypeCreateResponse } =
	createCrudResponses({
		list: GoodsTypeDto,
		detail: GoodsTypeDto,
	});

const { list: GoodListResponse, create: GoodCreateResponse } =
	createCrudResponses({
		list: GoodDto,
		detail: GoodDto,
	});

const {
	list: AccessoryOperationListResponse,
	create: AccessoryOperationCreateResponse,
} = createCrudResponses({
	list: AccessoryOperationDto,
	detail: AccessoryOperationDto,
});

const {
	list: RejectionReasonListResponse,
	create: RejectionReasonCreateResponse,
} = createCrudResponses({
	list: RejectionReasonDto,
	detail: RejectionReasonDto,
});

@Controller("catalog")
export class CatalogController {
	constructor(private readonly catalogService: CatalogService) {}

	@Get("units")
	@RequireAny(Permission.CATALOG_READ)
	@UnitListResponse()
	async findUnits() {
		return this.catalogService.findAllUnits();
	}

	@Post("units")
	@RequireAny(Permission.CATALOG_MANAGE_UNITS)
	@UnitCreateResponse()
	async createUnit(@Body() dto: CreateUnitDto) {
		return this.catalogService.createUnit(dto);
	}

	@Get("goods-types")
	@RequireAny(Permission.CATALOG_READ)
	@GoodsTypeListResponse()
	async findGoodsTypes() {
		return this.catalogService.findAllGoodsTypes();
	}

	@Post("goods-types")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS_TYPES)
	@GoodsTypeCreateResponse()
	async createGoodsType(@Body() dto: CreateGoodsTypeDto) {
		return this.catalogService.createGoodsType(dto);
	}

	@Get("goods")
	@RequireAny(Permission.CATALOG_READ)
	@GoodListResponse()
	async findGoods() {
		return this.catalogService.findAllGoods();
	}

	@Post("goods")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS)
	@GoodCreateResponse()
	async createGood(@Body() dto: CreateGoodDto) {
		return this.catalogService.createGood(dto);
	}

	@Get("accessory-operations")
	@RequireAny(Permission.CATALOG_READ)
	@AccessoryOperationListResponse()
	async findAccessoryOperations() {
		return this.catalogService.findAllAccessoryOperations();
	}

	@Post("accessory-operations")
	@RequireAny(Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS)
	@AccessoryOperationCreateResponse()
	async createAccessoryOperation(@Body() dto: CreateAccessoryOperationDto) {
		return this.catalogService.createAccessoryOperation(dto);
	}

	@Get("rejection-reasons")
	@RequireAny(Permission.CATALOG_READ)
	@RejectionReasonListResponse()
	async findRejectionReasons() {
		return this.catalogService.findAllRejectionReasons();
	}

	@Post("rejection-reasons")
	@RequireAny(Permission.CATALOG_MANAGE_REJECTION_REASONS)
	@RejectionReasonCreateResponse()
	async createRejectionReason(@Body() dto: CreateRejectionReasonDto) {
		return this.catalogService.createRejectionReason(dto);
	}
}
