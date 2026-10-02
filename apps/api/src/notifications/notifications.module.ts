import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/database/drizzle.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsQuery } from "./notifications.query";
import { NotificationsService } from "./notifications.service";

@Module({
	imports: [DrizzleModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsQuery, NotificationsMapper],
	exports: [NotificationsService],
})
export class NotificationsModule {}
