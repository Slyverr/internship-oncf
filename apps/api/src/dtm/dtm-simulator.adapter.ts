import {
	NotificationChannel,
	NotificationMessageCode,
	NotificationType,
	Permission,
} from "@ecommand/shared";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "@/auth/auth.types";
import { NotificationsService } from "@/notifications/notifications.service";
import type { OrderDetail } from "@/orders/orders.types";
import type { ProgramDetail } from "@/programs/programs.types";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
import type { DtmGateway } from "./dtm.gateway";
import {
	type DtmCompletion,
	DtmQuery,
	type DtmSimulationResult,
} from "./dtm.query";
import type { DtmSimulatorResponseMode } from "./dtm-simulator.types";

const DEFAULT_SIMULATOR_DELAY_SECONDS = 2;
const MAX_SIMULATOR_DELAY_SECONDS = 60;
const MIN_SIMULATOR_DELAY_SECONDS = 0;

@Injectable()
export class DtmSimulatorAdapter implements DtmGateway, OnModuleDestroy {
	private readonly logger = new Logger(DtmSimulatorAdapter.name);
	private readonly pendingResponses = new Map<
		number,
		{ timer: ReturnType<typeof setTimeout> }
	>();

	constructor(
		private readonly config: ConfigService,
		private readonly dtmQuery: DtmQuery,
		private readonly realtimeEvents: RealtimeEventsService,
		private readonly notifications: NotificationsService,
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
		this.publishActivityChanged(request.id, "PENDING", user.id, {
			relatedEntityType: "orders",
			relatedEntityCode: order.orderNumber,
		});
		this.publishPendingRequest(request.id, "orders", order.orderNumber);
		if (this.getResponseMode() === "AUTO") {
			this.scheduleResponse(request.id, order.orderNumber, "orders");
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
		this.publishActivityChanged(request.id, "PENDING", user.id, {
			relatedEntityType: "forecast_programs",
			relatedEntityCode: program.programNumber,
		});
		this.publishPendingRequest(
			request.id,
			"forecast_programs",
			program.programNumber,
		);
		if (this.getResponseMode() === "AUTO") {
			this.scheduleResponse(
				request.id,
				program.programNumber,
				"forecast_programs",
			);
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
		);

		if (resolved && pending) {
			clearTimeout(pending.timer);
			this.pendingResponses.delete(requestId);
		}
		if (resolved) {
			this.publishActivityChanged(
				requestId,
				result,
				resolved.createdByUserId,
				resolved,
			);
			await this.notifyRelatedRecordOwner(result, resolved);
			this.publishRelatedRecordChanged(resolved);
		}

		return resolved;
	}

	private scheduleResponse(
		requestId: number,
		identifier: string,
		entityType: "orders" | "forecast_programs",
	) {
		const delayMs = this.readDelay();
		const result = this.readResult();
		const timer = setTimeout(() => {
			this.pendingResponses.delete(requestId);
			const completion = this.dtmQuery.completeSimulatorRequest(
				requestId,
				result,
			);
			void completion.then(
				(completed) => {
					if (completed) {
						this.publishActivityChanged(
							requestId,
							result,
							completed.createdByUserId,
							completed,
						);
						void this.notifyRelatedRecordOwner(result, completed);
						this.publishRelatedRecordChanged(completed, entityType);
					}
				},
				(error: unknown) => {
					this.logger.error(
						`Failed to record simulated DTM response for ${identifier}`,
						error instanceof Error ? error.stack : String(error),
					);
				},
			);
		}, delayMs);
		this.pendingResponses.set(requestId, { timer });
	}

	onModuleDestroy() {
		for (const { timer } of this.pendingResponses.values()) clearTimeout(timer);
		this.pendingResponses.clear();
	}

	private readDelay(): number {
		const configuredSeconds = Number(
			this.config.get(
				"DTM_SIMULATOR_DELAY_SECONDS",
				DEFAULT_SIMULATOR_DELAY_SECONDS,
			),
		);
		if (!Number.isFinite(configuredSeconds)) {
			return DEFAULT_SIMULATOR_DELAY_SECONDS * 1_000;
		}
		const boundedSeconds = Math.min(
			Math.max(configuredSeconds, MIN_SIMULATOR_DELAY_SECONDS),
			MAX_SIMULATOR_DELAY_SECONDS,
		);
		return Math.round(boundedSeconds * 1_000);
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

	private publishActivityChanged(
		requestId: number,
		status: string,
		createdByUserId?: number | null,
		reference?: Pick<DtmCompletion, "relatedEntityType" | "relatedEntityCode">,
	) {
		this.realtimeEvents.publish(
			REALTIME_EVENT_TYPES.dtmActivityChanged,
			{
				requestId,
				status,
				relatedEntityType: reference?.relatedEntityType,
				relatedEntityCode: reference?.relatedEntityCode,
			},
			{
				permission: Permission.INTEGRATIONS_MANAGE,
				...(createdByUserId != null && { userId: createdByUserId }),
			},
		);
	}

	private publishPendingRequest(
		requestId: number,
		relatedEntityType: "orders" | "forecast_programs",
		relatedEntityCode: string,
	) {
		this.realtimeEvents.publish(
			REALTIME_EVENT_TYPES.dtmRequestPending,
			{ requestId, relatedEntityType, relatedEntityCode },
			{ permission: Permission.INTEGRATIONS_MANAGE },
		);
	}

	private publishRelatedRecordChanged(
		completion: DtmCompletion,
		fallbackType?: "orders" | "forecast_programs",
	) {
		if (
			completion.createdByUserId === null ||
			completion.relatedEntityId === null
		)
			return;
		const recipientUserIds = new Set([
			completion.createdByUserId,
			completion.relatedEntityOwnerUserId,
		]);
		const entityType = completion.relatedEntityType ?? fallbackType;
		if (entityType === "orders") {
			this.realtimeEvents.publishToPermission(
				Permission.ORDERS_READ,
				REALTIME_EVENT_TYPES.ordersChanged,
			);
			for (const userId of recipientUserIds) {
				if (userId === null) continue;
				this.realtimeEvents.publishToUser(
					userId,
					REALTIME_EVENT_TYPES.ordersChanged,
					{
						id: completion.relatedEntityId,
						code: completion.relatedEntityCode,
					},
				);
			}
		} else if (entityType === "forecast_programs") {
			this.realtimeEvents.publishToPermission(
				Permission.PROGRAMS_READ,
				REALTIME_EVENT_TYPES.programsChanged,
			);
			for (const userId of recipientUserIds) {
				if (userId === null) continue;
				this.realtimeEvents.publishToUser(
					userId,
					REALTIME_EVENT_TYPES.programsChanged,
					{
						id: completion.relatedEntityId,
						code: completion.relatedEntityCode,
					},
				);
			}
		}
	}

	private async notifyRelatedRecordOwner(
		status: DtmSimulationResult,
		completion: DtmCompletion,
	) {
		if (
			completion.relatedEntityOwnerUserId === null ||
			completion.relatedEntityType === null ||
			completion.relatedEntityId === null ||
			completion.relatedEntityCode === null
		)
			return;
		try {
			await this.notifications.create({
				userId: completion.relatedEntityOwnerUserId,
				type: NotificationType.DTM_RESPONSE,
				channel: NotificationChannel.IN_APP,
				messageCode: NotificationMessageCode.DTM_RESPONSE,
				messageParameters: {
					recordCode: completion.relatedEntityCode,
					status,
				},
				relatedEntityType:
					completion.relatedEntityType === "forecast_programs"
						? "programs"
						: completion.relatedEntityType,
				relatedEntityId: completion.relatedEntityId,
			});
		} catch (error) {
			this.logger.error(
				`Failed to persist DTM response notification for ${completion.relatedEntityCode}`,
				error instanceof Error ? error.stack : String(error),
			);
		}
	}
}
