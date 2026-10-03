import { Module } from "@nestjs/common";
import { ActiveReferenceDataController } from "./active-reference-data.controller";
import { CatalogController } from "./catalog.controller";
import { CatalogMapper } from "./catalog.mapper";
import { CatalogQuery } from "./catalog.query";
import { CatalogService } from "./catalog.service";
import { ManagedReferenceDataController } from "./managed-reference-data.controller";
import { ManagedReferenceDataGuard } from "./managed-reference-data.guard";

@Module({
	controllers: [
		CatalogController,
		ManagedReferenceDataController,
		ActiveReferenceDataController,
	],
	providers: [
		CatalogService,
		CatalogQuery,
		CatalogMapper,
		ManagedReferenceDataGuard,
	],
	exports: [CatalogService],
})
export class CatalogModule {}
