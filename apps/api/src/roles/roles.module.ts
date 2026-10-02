import { Module } from "@nestjs/common";
import { RolesController } from "./roles.controller";
import { RolesQuery } from "./roles.query";
import { RolesService } from "./roles.service";

@Module({
	controllers: [RolesController],
	providers: [RolesService, RolesQuery],
})
export class RolesModule {}
