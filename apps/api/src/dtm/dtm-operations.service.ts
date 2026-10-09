import { API_ERROR_CODES } from "@ecommand/shared";
import { ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DtmQuery, type DtmSimulationResult } from "./dtm.query";
import { DtmSimulatorAdapter } from "./dtm-simulator.adapter";

@Injectable()
export class DtmOperationsService {
	constructor(
		private readonly config: ConfigService,
		private readonly dtmQuery: DtmQuery,
		private readonly simulator: DtmSimulatorAdapter,
	) {}

	async list() {
		const mode = this.getMode();
		const requests = await this.dtmQuery.findRecentRequests();
		return {
			mode,
			responseMode:
				mode === "SIMULATOR" ? this.simulator.getResponseMode() : null,
			requests: requests.map(({ dtmRequestType, ...request }) => ({
				...request,
				requestType: dtmRequestType?.name ?? "Unknown request",
			})),
		};
	}

	async resolve(
		requestId: number,
		result: DtmSimulationResult,
		resolvedByUserId: number,
	) {
		if (this.getMode() !== "SIMULATOR") {
			throw new ConflictException({ code: API_ERROR_CODES.CONFLICT });
		}

		const resolved = await this.simulator.resolvePendingRequest(
			requestId,
			result,
			resolvedByUserId,
		);
		if (!resolved) {
			throw new ConflictException({ code: API_ERROR_CODES.CONFLICT });
		}
		return {
			id: requestId,
			result,
			status: result === "ACCEPTED" ? "SUCCESS" : "FAILED",
		};
	}

	private getMode(): "SIMULATOR" | "DISABLED" {
		return this.config.get<string>("DTM_MODE", "disabled") === "simulator"
			? "SIMULATOR"
			: "DISABLED";
	}
}
