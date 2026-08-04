import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CustomersModule } from "./customers/customers.module";
import { DrizzleModule } from "./db/drizzle.module";
import { OrdersModule } from "./orders/orders.module";
import { ProgramsModule } from "./programs/programs.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DrizzleModule,
		UsersModule,
		AuthModule,
		OrdersModule,
		ProgramsModule,
		CustomersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
