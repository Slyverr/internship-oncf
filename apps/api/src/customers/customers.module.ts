import { Module } from "@nestjs/common";
import { CustomersController } from "./customers.controller";
import { CustomersMapper } from "./customers.mapper";
import { CustomersQuery } from "./customers.query";
import { CustomersService } from "./customers.service";

@Module({
	controllers: [CustomersController],
	providers: [CustomersService, CustomersQuery, CustomersMapper],
	exports: [CustomersService],
})
export class CustomersModule {}
