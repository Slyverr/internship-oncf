import { Controller, Request, Sse } from "@nestjs/common";
import { ApiProduces } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RealtimeEventsService } from "./realtime-events.service";

@Controller("realtime")
export class RealtimeController {
	constructor(private readonly events: RealtimeEventsService) {}

	@Sse("events")
	@ApiProduces("text/event-stream")
	stream(@Request() request: AuthRequest) {
		return this.events.streamFor(request.user);
	}
}
