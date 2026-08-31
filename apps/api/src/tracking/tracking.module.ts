import { Module } from "@nestjs/common";
import { OrdersModule } from "@/orders/orders.module";
import { TrackingController } from "./tracking.controller";
import { TrackingQuery } from "./tracking.query";
import { TrackingService } from "./tracking.service";

@Module({
	imports: [OrdersModule],
	controllers: [TrackingController],
	providers: [TrackingService, TrackingQuery],
	exports: [TrackingService],
})
export class TrackingModule {}
