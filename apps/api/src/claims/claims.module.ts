import { Module } from "@nestjs/common";
import { ClaimsController } from "./claims.controller";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import { ClaimsService } from "./claims.service";

@Module({
	controllers: [ClaimsController],
	providers: [ClaimsService, ClaimsQuery, ClaimsMapper],
	exports: [ClaimsService],
})
export class ClaimsModule {}
