import { Module } from "@nestjs/common";
import { NotificationsModule } from "@/notifications/notifications.module";
import { ClaimsController } from "./claims.controller";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import { ClaimsService } from "./claims.service";

@Module({
	imports: [NotificationsModule],
	controllers: [ClaimsController],
	providers: [ClaimsService, ClaimsQuery, ClaimsMapper],
	exports: [ClaimsService],
})
export class ClaimsModule {}
