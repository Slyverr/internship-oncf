import { Injectable } from "@nestjs/common";
import { dtmIntegrationLog, forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { DTM_REQUEST_TYPES } from "@/database/reference-data";
import type { OrderId } from "@/orders/orders.types";
import type { ProgramId } from "@/programs/programs.types";

export type DtmSimulationResult = "ACCEPTED" | "REJECTED";

@Injectable()
export class DtmQuery {
	constructor(private readonly drizzle: DrizzleService) {}

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

	async completeOrderRequest(
		requestId: number,
		result: DtmSimulationResult,
		durationMs: number,
	) {
		const accepted = result === "ACCEPTED";
		await this.drizzle.db
			.update(dtmIntegrationLog)
			.set({
				responsePayload: JSON.stringify({
					requestId: String(requestId),
					status: result,
					respondedAt: new Date().toISOString(),
				}),
				status: accepted ? "SUCCESS" : "FAILED",
				httpStatusCode: accepted ? 200 : 422,
				durationMs,
			})
			.where(eq(dtmIntegrationLog.id, requestId));
	}

	async completeProgramRequest(
		requestId: number,
		programId: ProgramId,
		result: DtmSimulationResult,
		durationMs: number,
	) {
		const accepted = result === "ACCEPTED";
		const responsePayload = JSON.stringify({
			requestId: String(requestId),
			status: result,
			respondedAt: new Date().toISOString(),
		});

		await this.drizzle.db.transaction(async (tx) => {
			await tx
				.update(dtmIntegrationLog)
				.set({
					responsePayload,
					status: accepted ? "SUCCESS" : "FAILED",
					httpStatusCode: accepted ? 200 : 422,
					durationMs,
				})
				.where(eq(dtmIntegrationLog.id, requestId));

			await tx
				.update(forecastPrograms)
				.set({ dtmStatus: result })
				.where(eq(forecastPrograms.id, programId));
		});
	}
}
