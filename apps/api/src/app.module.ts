import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { ClaimsModule } from "./claims/claims.module";
import { CustomersModule } from "./customers/customers.module";
import { DrizzleModule } from "./database/drizzle.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { OrdersModule } from "./orders/orders.module";
import { ProfileModule } from "./profile/profile.module";
import { ProgramsModule } from "./programs/programs.module";
import { TrackingModule } from "./tracking/tracking.module";
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
		ProfileModule,
		CatalogModule,
		TrackingModule,
	],
	controllers: [AppController],
})
export class AppModule {}
