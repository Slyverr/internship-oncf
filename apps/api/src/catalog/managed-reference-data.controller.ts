import {
	MANAGED_REFERENCE_RESOURCES,
	ManagedReferenceResource,
} from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ApiPathParam } from "@/common/decorators/api-path-param.decorator";
import { CatalogService } from "./catalog.service";
import { ManagedReferenceDataGuard } from "./managed-reference-data.guard";
import {
	CreateManagedReferenceDataDto,
	UpdateManagedReferenceDataDto,
} from "./requests/managed-reference-data.dto";
import { ManagedReferenceDataDto } from "./responses/managed-reference-data.dto";

const {
	list: ManagedReferenceDataListResponse,
	create: ManagedReferenceDataCreateResponse,
	update: ManagedReferenceDataUpdateResponse,
} = createCrudResponses({
	list: ManagedReferenceDataDto,
	detail: ManagedReferenceDataDto,
	create: ManagedReferenceDataDto,
	update: ManagedReferenceDataDto,
});

@Controller("catalog/managed-reference-data")
@UseGuards(ManagedReferenceDataGuard)
@ApiParam({ name: "resource", enum: MANAGED_REFERENCE_RESOURCES })
export class ManagedReferenceDataController {
	constructor(private readonly catalogService: CatalogService) {}

	@Get(":resource")
	@ManagedReferenceDataListResponse()
	async findAll(@Param("resource") resource: ManagedReferenceResource) {
		return this.catalogService.findManagedReferenceData(resource);
	}

	@Post(":resource")
	@ManagedReferenceDataCreateResponse()
	async create(
		@Param("resource") resource: ManagedReferenceResource,
		@Body() dto: CreateManagedReferenceDataDto,
	) {
		return this.catalogService.createManagedReferenceData(resource, dto);
	}

	@Patch(":resource/:id")
	@ManagedReferenceDataUpdateResponse()
	async update(
		@Param("resource") resource: ManagedReferenceResource,
		@ApiPathParam("id", ParseIntPipe) id: number,
		@Body() dto: UpdateManagedReferenceDataDto,
	) {
		return this.catalogService.updateManagedReferenceData(resource, id, dto);
	}
}
