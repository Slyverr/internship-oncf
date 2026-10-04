import {
	Body,
	Controller,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { Public } from "@/auth/public.decorator";
import { UpdateWagonPositionDto } from "@/tracking/requests/update-wagon-position.dto";
import { TrackingService } from "@/tracking/tracking.service";
import { IntegrationCredentialGuard } from "./integration-credential.guard";

@Controller("integration/tracking")
export class IntegrationTrackingController {
	constructor(private readonly tracking: TrackingService) {}

	@Post("wagons/:wagonNumber/positions")
	@Public()
	@UseGuards(IntegrationCredentialGuard)
	updateWagonPosition(
		@Param("wagonNumber") wagonNumber: string,
		@Body() dto: UpdateWagonPositionDto,
		@Request()
		request: { integrationCredential: { id: number; permissions: string[] } },
	) {
		return this.tracking.updateWagonPositionByNumber(
			wagonNumber,
			dto,
			request.integrationCredential.id,
		);
	}
}
