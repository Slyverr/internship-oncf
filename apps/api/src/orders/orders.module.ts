import { Module } from "@nestjs/common";
import { DrizzleModule } from "../db/drizzle.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
	imports: [DrizzleModule],
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}
