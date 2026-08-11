import { Module } from "@nestjs/common";
import { StorageModule } from "src/storage/storage.module";
import { UsersModule } from "src/users/users.module";
import { FilesController } from "./files/files.controller";
import { FilesService } from "./files/files.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
	imports: [UsersModule, StorageModule],
	controllers: [OrdersController, FilesController],
	providers: [OrdersService, FilesService],
	exports: [OrdersService],
})
export class OrdersModule {}
