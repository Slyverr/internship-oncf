import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import type { OrderDetail } from "@/orders/orders.types";
import type { ProgramDetail } from "@/programs/programs.types";
import type { DtmGateway } from "./dtm.gateway";
import { DtmQuery, type DtmSimulationResult } from "./dtm.query";
import type { DtmSimulatorResponseMode } from "./dtm-simulator.types";

const DEFAULT_SIMULATOR_DELAY_MS = 2_000;
const MAX_SIMULATOR_DELAY_MS = 60_000;

@Injectable()
export class DtmSimulatorAdapter implements DtmGateway, OnModuleDestroy {
	private readonly logger = new Logger(DtmSimulatorAdapter.name);
	private readonly pendingResponses = new Map<
		number,
		{ timer: ReturnType<typeof setTimeout>; startedAt: number }
	>();

	constructor(
		private readonly config: ConfigService,
		private readonly dtmQuery: DtmQuery,
	) {}

	async submitOrder(order: OrderDetail, user: AuthUser): Promise<void> {
		const payload = {
			contract: "ecommand-dtm-simulator-v1",
			source: "ECommand",
			order: {
				orderNumber: order.orderNumber,
				customerId: order.customerId,
				quantityDemanded: order.quantityDemanded,
				orderDate: order.orderDate,
			},
		};
		const request = await this.dtmQuery.createOrderRequest(
			order.id,
			user.id,
			payload,
		);
		if (this.getResponseMode() === "AUTO") {
			this.scheduleResponse(request.id, order.orderNumber);
		}
	}

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
		if (this.getResponseMode() === "AUTO") {
			this.scheduleResponse(request.id, program.programNumber);
		}
	}

	async resolvePendingRequest(
		requestId: number,
		result: DtmSimulationResult,
		resolvedByUserId: number,
	) {
		const pending = this.pendingResponses.get(requestId);
		const resolved = await this.dtmQuery.resolvePendingRequest(
			requestId,
			result,
			resolvedByUserId,
			pending ? Date.now() - pending.startedAt : undefined,
		);

		if (resolved && pending) {
			clearTimeout(pending.timer);
			this.pendingResponses.delete(requestId);
		}

		return resolved;
	}

	private scheduleResponse(requestId: number, identifier: string) {
		const delayMs = this.readDelay();
		const result = this.readResult();
		const startedAt = Date.now();
		const timer = setTimeout(() => {
			this.pendingResponses.delete(requestId);
			const completion = this.dtmQuery.completeSimulatorRequest(
				requestId,
				result,
				Date.now() - startedAt,
			);
			void completion.catch((error: unknown) => {
				this.logger.error(
					`Failed to record simulated DTM response for ${identifier}`,
					error instanceof Error ? error.stack : String(error),
				);
			});
		}, delayMs);
		this.pendingResponses.set(requestId, { timer, startedAt });
	}

	onModuleDestroy() {
		for (const { timer } of this.pendingResponses.values()) clearTimeout(timer);
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

	getResponseMode(): DtmSimulatorResponseMode {
		return this.config.get<string>("DTM_SIMULATOR_RESPONSE_MODE", "manual") ===
			"auto"
			? "AUTO"
			: "MANUAL";
	}

	private readResult(): DtmSimulationResult {
		return this.config.get("DTM_SIMULATOR_RESULT", "ACCEPTED") === "REJECTED"
			? "REJECTED"
			: "ACCEPTED";
	}
}
