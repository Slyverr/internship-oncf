import {
	MANAGED_REFERENCE_RESOURCES,
	ManagedReferenceResource,
	Permission,
} from "@ecommand/shared";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { CatalogService } from "./catalog.service";
import { ManagedReferenceDataDto } from "./responses/managed-reference-data.dto";

const { list: ActiveReferenceDataListResponse } = createCrudResponses({
	list: ManagedReferenceDataDto,
	detail: ManagedReferenceDataDto,
});

@Controller("catalog/active-reference-data")
@ApiParam({ name: "resource", enum: MANAGED_REFERENCE_RESOURCES })
export class ActiveReferenceDataController {
	constructor(private readonly catalogService: CatalogService) {}

	@Get(":resource")
	@RequireAny(Permission.CATALOG_READ)
	@ActiveReferenceDataListResponse()
	async findAll(@Param("resource") resource: ManagedReferenceResource) {
		return this.catalogService.findActiveReferenceData(resource);
	}
}
