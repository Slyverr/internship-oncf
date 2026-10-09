import { Global, Module } from "@nestjs/common";
import { RealtimeController } from "./realtime.controller";
import { RealtimeEventsService } from "./realtime-events.service";

@Global()
@Module({
	controllers: [RealtimeController],
	providers: [RealtimeEventsService],
	exports: [RealtimeEventsService],
})
export class RealtimeModule {}
