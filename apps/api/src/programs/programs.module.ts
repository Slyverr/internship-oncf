import { Module } from "@nestjs/common";
import { DtmModule } from "@/dtm/dtm.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { OrdersModule } from "@/orders/orders.module";
import { ProgramsController } from "./programs.controller";
import { ProgramsMapper } from "./programs.mapper";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";

@Module({
	imports: [DtmModule, NotificationsModule, OrdersModule],
	controllers: [ProgramsController],
	providers: [ProgramsService, ProgramsQuery, ProgramsMapper],
	exports: [ProgramsService],
})
export class ProgramsModule {}
