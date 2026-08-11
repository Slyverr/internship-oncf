import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { ClaimsModule } from "./claims/claims.module";
import { CustomersModule } from "./customers/customers.module";
import { DrizzleModule } from "./db/drizzle.module";
import { NotificationsModule } from "./notifications/notifications.module";
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
		ClaimsModule,
		NotificationsModule,
	],
	controllers: [AppController],
})
export class AppModule {}
