import { Module } from "@nestjs/common";
import { OrdersModule } from "src/orders/orders.module";
import { ProgramsController } from "./programs.controller";
import { ProgramsService } from "./programs.service";

@Module({
	imports: [OrdersModule],
	controllers: [ProgramsController],
	providers: [ProgramsService],
	exports: [ProgramsService],
})
export class ProgramsModule {}
