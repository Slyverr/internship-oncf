import { Module } from "@nestjs/common";
import { TrackingModule } from "@/tracking/tracking.module";
import { IntegrationCredentialGuard } from "./integration-credential.guard";
import { IntegrationCredentialsController } from "./integration-credentials.controller";
import { IntegrationCredentialsQuery } from "./integration-credentials.query";
import { IntegrationCredentialsService } from "./integration-credentials.service";
import { IntegrationTrackingController } from "./integration-tracking.controller";

@Module({
	imports: [TrackingModule],
	controllers: [
		IntegrationCredentialsController,
		IntegrationTrackingController,
	],
	providers: [
		IntegrationCredentialsQuery,
		IntegrationCredentialsService,
		IntegrationCredentialGuard,
	],
	exports: [IntegrationCredentialsService],
})
export class IntegrationCredentialsModule {}
