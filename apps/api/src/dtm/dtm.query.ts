import { Injectable } from "@nestjs/common";
import { dtmIntegrationLog, forecastPrograms } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { DTM_REQUEST_TYPES } from "@/database/reference-data";
import type { OrderId } from "@/orders/orders.types";
import type { ProgramId } from "@/programs/programs.types";

export type DtmSimulationResult = "ACCEPTED" | "REJECTED";
export type DtmResolutionSource = "SIMULATOR" | "MANUAL_SIMULATOR";

@Injectable()
export class DtmQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	findRecentRequests() {
		return this.drizzle.db.query.dtmIntegrationLog.findMany({
			columns: {
				id: true,
				status: true,
				createdAt: true,
				relatedEntityType: true,
				relatedEntityId: true,
				httpStatusCode: true,
				errorMessage: true,
				durationMs: true,
				requestPayload: true,
				responsePayload: true,
			},
			with: {
				dtmRequestType: {
					columns: { name: true },
				},
			},
			orderBy: { createdAt: "desc", id: "desc" },
			limit: 100,
		});
	}

	async createProgramRequest(
		programId: ProgramId,
		userId: number,
		payload: Record<string, unknown>,
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const [request] = await tx
				.insert(dtmIntegrationLog)
				.values({
					requestTypeId: DTM_REQUEST_TYPES.SEND_PROGRAM.id,
					requestPayload: JSON.stringify(payload),
					status: "PENDING",
					httpStatusCode: 202,
					relatedEntityType: "forecast_programs",
					relatedEntityId: programId,
					createdByUserId: userId,
				})
				.returning({ id: dtmIntegrationLog.id });

			await tx
				.update(forecastPrograms)
				.set({ dtmStatus: "PENDING" })
				.where(eq(forecastPrograms.id, programId));

			return request;
		});
	}

	async createOrderRequest(
		orderId: OrderId,
		userId: number,
		payload: Record<string, unknown>,
	) {
		return this.drizzle.db
			.insert(dtmIntegrationLog)
			.values({
				requestTypeId: DTM_REQUEST_TYPES.SEND_ORDER.id,
				requestPayload: JSON.stringify(payload),
				status: "PENDING",
				httpStatusCode: 202,
				relatedEntityType: "orders",
				relatedEntityId: orderId,
				createdByUserId: userId,
			})
			.returning({ id: dtmIntegrationLog.id })
			.then(([request]) => request);
	}

	async completeSimulatorRequest(
		requestId: number,
		result: DtmSimulationResult,
		durationMs: number,
	) {
		return this.completePendingRequest(
			requestId,
			result,
			durationMs,
			"SIMULATOR",
		);
	}

	async resolvePendingRequest(
		requestId: number,
		result: DtmSimulationResult,
		resolvedByUserId: number,
		durationMs?: number,
	) {
		return this.completePendingRequest(
			requestId,
			result,
			durationMs,
			"MANUAL_SIMULATOR",
			resolvedByUserId,
		);
	}

	private async completePendingRequest(
		requestId: number,
		result: DtmSimulationResult,
		durationMs: number | undefined,
		source: DtmResolutionSource,
		resolvedByUserId?: number,
	) {
		const accepted = result === "ACCEPTED";
		const respondedAt = new Date();

		return this.drizzle.db.transaction(async (tx) => {
			const [pending] = await tx
				.select({
					createdAt: dtmIntegrationLog.createdAt,
					relatedEntityType: dtmIntegrationLog.relatedEntityType,
					relatedEntityId: dtmIntegrationLog.relatedEntityId,
				})
				.from(dtmIntegrationLog)
				.where(
					and(
						eq(dtmIntegrationLog.id, requestId),
						eq(dtmIntegrationLog.status, "PENDING"),
					),
				)
				.for("update");

			if (!pending) return false;

			await tx
				.update(dtmIntegrationLog)
				.set({
					responsePayload: JSON.stringify({
						requestId: String(requestId),
						status: result,
						respondedAt: respondedAt.toISOString(),
						source,
						...(resolvedByUserId !== undefined && { resolvedByUserId }),
					}),
					status: accepted ? "SUCCESS" : "FAILED",
					httpStatusCode: accepted ? 200 : 422,
					durationMs:
						durationMs ??
						Math.max(
							0,
							respondedAt.getTime() - new Date(pending.createdAt).getTime(),
						),
				})
				.where(
					and(
						eq(dtmIntegrationLog.id, requestId),
						eq(dtmIntegrationLog.status, "PENDING"),
					),
				);

			if (
				pending.relatedEntityType === "forecast_programs" &&
				pending.relatedEntityId !== null
			) {
				await tx
					.update(forecastPrograms)
					.set({ dtmStatus: result })
					.where(eq(forecastPrograms.id, pending.relatedEntityId));
			}

			return true;
		});
	}
}
