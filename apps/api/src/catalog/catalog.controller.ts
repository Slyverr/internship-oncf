import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
} from "@nestjs/common";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import {
	ApiPathParam,
	ApiStringPathParam,
} from "@/common/decorators/api-path-param.decorator";
import { CatalogService } from "./catalog.service";
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
import {
	AccessoryOperationDto,
	CustomerTypeDto,
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
const { list: CustomerTypeListResponse } = createCrudResponses({
	list: CustomerTypeDto,
	detail: CustomerTypeDto,
});
const { list: UnitManageListResponse, update: UnitUpdateResponse } =
	createCrudResponses({
		list: UnitDto,
		detail: UnitDto,
		update: UnitDto,
	});

const { list: GoodsTypeListResponse, create: GoodsTypeCreateResponse } =
	createCrudResponses({
		list: GoodsTypeDto,
		detail: GoodsTypeDto,
	});
const { list: GoodsTypeManageListResponse, update: GoodsTypeUpdateResponse } =
	createCrudResponses({
		list: GoodsTypeDto,
		detail: GoodsTypeDto,
		update: GoodsTypeDto,
	});

const { list: GoodListResponse, create: GoodCreateResponse } =
	createCrudResponses({
		list: GoodDto,
		detail: GoodDto,
	});
const { list: GoodManageListResponse, update: GoodUpdateResponse } =
	createCrudResponses({
		list: GoodDto,
		detail: GoodDto,
		update: GoodDto,
	});

const {
	list: AccessoryOperationListResponse,
	create: AccessoryOperationCreateResponse,
} = createCrudResponses({
	list: AccessoryOperationDto,
	detail: AccessoryOperationDto,
});
const {
	list: AccessoryOperationManageListResponse,
	update: AccessoryOperationUpdateResponse,
} = createCrudResponses({
	list: AccessoryOperationDto,
	detail: AccessoryOperationDto,
	update: AccessoryOperationDto,
});

const {
	list: RejectionReasonListResponse,
	create: RejectionReasonCreateResponse,
} = createCrudResponses({
	list: RejectionReasonDto,
	detail: RejectionReasonDto,
});
const {
	list: RejectionReasonManageListResponse,
	update: RejectionReasonUpdateResponse,
} = createCrudResponses({
	list: RejectionReasonDto,
	detail: RejectionReasonDto,
	update: RejectionReasonDto,
});

@Controller("catalog")
export class CatalogController {
	constructor(private readonly catalogService: CatalogService) {}

	@Get("customer-types")
	@RequireAny(Permission.CATALOG_READ)
	@CustomerTypeListResponse()
	async findCustomerTypes() {
		return this.catalogService.findAllCustomerTypes();
	}

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

	@Get("manage/units")
	@RequireAny(Permission.CATALOG_MANAGE_UNITS)
	@UnitManageListResponse()
	async findManageUnits() {
		return this.catalogService.findManageUnits();
	}

	@Patch("manage/units/:id")
	@RequireAny(Permission.CATALOG_MANAGE_UNITS)
	@UnitUpdateResponse()
	async updateUnit(
		@ApiStringPathParam("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateUnitDto,
	) {
		return this.catalogService.updateUnit(id, dto);
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

	@Get("manage/goods-types")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS_TYPES)
	@GoodsTypeManageListResponse()
	async findManageGoodsTypes() {
		return this.catalogService.findManageGoodsTypes();
	}

	@Patch("manage/goods-types/:id")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS_TYPES)
	@GoodsTypeUpdateResponse()
	async updateGoodsType(
		@ApiStringPathParam("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateGoodsTypeDto,
	) {
		return this.catalogService.updateGoodsType(id, dto);
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

	@Get("manage/goods")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS)
	@GoodManageListResponse()
	async findManageGoods() {
		return this.catalogService.findManageGoods();
	}

	@Patch("manage/goods/:id")
	@RequireAny(Permission.CATALOG_MANAGE_GOODS)
	@GoodUpdateResponse()
	async updateGood(
		@ApiPathParam("id", ParseIntPipe) id: number,
		@Body() dto: UpdateGoodDto,
	) {
		return this.catalogService.updateGood(id, dto);
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

	@Get("manage/accessory-operations")
	@RequireAny(Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS)
	@AccessoryOperationManageListResponse()
	async findManageAccessoryOperations() {
		return this.catalogService.findManageAccessoryOperations();
	}

	@Patch("manage/accessory-operations/:id")
	@RequireAny(Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS)
	@AccessoryOperationUpdateResponse()
	async updateAccessoryOperation(
		@ApiStringPathParam("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateAccessoryOperationDto,
	) {
		return this.catalogService.updateAccessoryOperation(id, dto);
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

	@Get("manage/rejection-reasons")
	@RequireAny(Permission.CATALOG_MANAGE_REJECTION_REASONS)
	@RejectionReasonManageListResponse()
	async findManageRejectionReasons() {
		return this.catalogService.findManageRejectionReasons();
	}

	@Patch("manage/rejection-reasons/:id")
	@RequireAny(Permission.CATALOG_MANAGE_REJECTION_REASONS)
	@RejectionReasonUpdateResponse()
	async updateRejectionReason(
		@ApiStringPathParam("id", ParseUUIDPipe) id: string,
		@Body() dto: UpdateRejectionReasonDto,
	) {
		return this.catalogService.updateRejectionReason(id, dto);
	}
}
