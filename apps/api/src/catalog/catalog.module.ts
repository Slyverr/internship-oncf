import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogMapper } from "./catalog.mapper";
import { CatalogQuery } from "./catalog.query";
import { CatalogService } from "./catalog.service";

@Module({
	controllers: [CatalogController],
	providers: [CatalogService, CatalogQuery, CatalogMapper],
	exports: [CatalogService],
})
export class CatalogModule {}
