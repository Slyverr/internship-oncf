import { Injectable } from "@nestjs/common";
import { dtmIntegrationLog, forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { DTM_REQUEST_TYPES } from "@/database/reference-data";
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
