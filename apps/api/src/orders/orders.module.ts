import { Module } from "@nestjs/common";
import { AttachmentsModule } from "@/attachments/attachments.module";
import { DtmModule } from "@/dtm/dtm.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { UsersModule } from "@/users/users.module";
import { FilesController } from "./files/files.controller";
import { FilesQuery } from "./files/files.query";
import { FilesService } from "./files/files.service";
import { OrdersController } from "./orders.controller";
import { OrdersMapper } from "./orders.mapper";
import { OrdersQuery } from "./orders.query";
import { OrdersService } from "./orders.service";

@Module({
	imports: [NotificationsModule, UsersModule, AttachmentsModule, DtmModule],
	controllers: [OrdersController, FilesController],
	providers: [
		OrdersService,
		OrdersQuery,
		OrdersMapper,
		FilesService,
		FilesQuery,
	],
	exports: [OrdersService],
})
export class OrdersModule {}
