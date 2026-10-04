import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import type { ProgramDetail } from "@/programs/programs.types";
import type { DtmGateway } from "./dtm.gateway";
import { DtmQuery, type DtmSimulationResult } from "./dtm.query";

const DEFAULT_SIMULATOR_DELAY_MS = 2_000;
const MAX_SIMULATOR_DELAY_MS = 60_000;

@Injectable()
export class DtmSimulatorAdapter implements DtmGateway, OnModuleDestroy {
	private readonly logger = new Logger(DtmSimulatorAdapter.name);
	private readonly pendingResponses = new Set<ReturnType<typeof setTimeout>>();

	constructor(
		private readonly config: ConfigService,
		private readonly dtmQuery: DtmQuery,
	) {}

	async submitProgram(program: ProgramDetail, user: AuthUser): Promise<void> {
		const payload = {
			contract: "ecommand-dtm-simulator-v1",
			source: "ECommand",
			program: {
				programNumber: program.programNumber,
				orderNumber: program.order?.orderNumber ?? null,
				plannedDate: program.plannedDate,
				quantityPlanned: program.quantityPlanned,
			},
		};
		const request = await this.dtmQuery.createProgramRequest(
			program.id,
			user.id,
			payload,
		);
		const delayMs = this.readDelay();
		const result = this.readResult();
		const startedAt = Date.now();
		const timer = setTimeout(() => {
			this.pendingResponses.delete(timer);
			void this.dtmQuery
				.completeProgramRequest(
					request.id,
					program.id,
					result,
					Date.now() - startedAt,
				)
				.catch((error: unknown) => {
					this.logger.error(
						`Failed to record simulated DTM response for ${program.programNumber}`,
						error instanceof Error ? error.stack : String(error),
					);
				});
		}, delayMs);
		this.pendingResponses.add(timer);
	}

	onModuleDestroy() {
		for (const timer of this.pendingResponses) clearTimeout(timer);
		this.pendingResponses.clear();
	}

	private readDelay(): number {
		const configured = Number(
			this.config.get("DTM_SIMULATOR_DELAY_MS", DEFAULT_SIMULATOR_DELAY_MS),
		);
		if (!Number.isFinite(configured) || configured < 0) {
			return DEFAULT_SIMULATOR_DELAY_MS;
		}
		return Math.min(Math.round(configured), MAX_SIMULATOR_DELAY_MS);
	}

	private readResult(): DtmSimulationResult {
		return this.config.get("DTM_SIMULATOR_RESULT", "ACCEPTED") === "REJECTED"
			? "REJECTED"
			: "ACCEPTED";
	}
}
