import { Module } from "@nestjs/common";
import { StorageModule } from "@/storage/storage.module";
import { UsersModule } from "@/users/users.module";
import { FilesController } from "./files/files.controller";
import { FilesQuery } from "./files/files.query";
import { FilesService } from "./files/files.service";
import { OrdersController } from "./orders.controller";
import { OrdersMapper } from "./orders.mapper";
import { OrdersQuery } from "./orders.query";
import { OrdersService } from "./orders.service";

@Module({
	imports: [UsersModule, StorageModule],
	controllers: [OrdersController, FilesController],
	providers: [
		OrdersService,
		OrdersQuery,
		OrdersMapper,
		FilesService,
		FilesService,
		FilesQuery,
	],
	exports: [OrdersService],
})
export class OrdersModule {}
