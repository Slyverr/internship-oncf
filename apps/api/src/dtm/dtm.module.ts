import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DTM_GATEWAY, selectDtmGateway } from "./dtm.gateway";
import { DtmQuery } from "./dtm.query";
import { DtmDisabledAdapter } from "./dtm-disabled.adapter";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

@Module({
	providers: [
		DtmQuery,
		DtmSimulatorAdapter,
		DtmDisabledAdapter,
		{
			provide: DTM_GATEWAY,
			inject: [ConfigService, DtmSimulatorAdapter, DtmDisabledAdapter],
			useFactory: (
				config: ConfigService,
				simulator: DtmSimulatorAdapter,
				disabled: DtmDisabledAdapter,
			) =>
				selectDtmGateway(
					config.get<string>("DTM_MODE", "disabled"),
					simulator,
					disabled,
				),
		},
	],
	exports: [DTM_GATEWAY],
})
export class DtmModule {}
