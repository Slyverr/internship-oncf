import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsQuery } from "./notifications.query";
import { NotificationsService } from "./notifications.service";

@Module({
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsQuery, NotificationsMapper],
	exports: [NotificationsService],
})
export class NotificationsModule {}
