import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersMapper } from "./users.mapper";
import { UsersQuery } from "./users.query";
import { UsersService } from "./users.service";

@Module({
	controllers: [UsersController],
	providers: [UsersService, UsersQuery, UsersMapper],
	exports: [UsersService],
})
export class UsersModule {}
