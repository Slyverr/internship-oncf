import { OrderStatus, ProgramStatus } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import {
	dtmIntegrationLog,
	forecastProgramHistory,
	forecastPrograms,
	orderStatusHistory,
	orders,
} from "drizzle/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import {
	DTM_REQUEST_TYPES,
	ORDER_STATUSES,
	PROGRAM_STATUSES,
} from "@/database/reference-data";
import type { OrderId } from "@/orders/orders.types";
import type { ProgramId } from "@/programs/programs.types";

export type DtmSimulationResult = "ACCEPTED" | "REJECTED";
export type DtmResolutionSource = "SIMULATOR" | "MANUAL_SIMULATOR";
export type DtmCompletion = {
	relatedEntityType: string | null;
	relatedEntityId: number | null;
	relatedEntityCode: string | null;
	createdByUserId: number | null;
	relatedEntityOwnerUserId: number | null;
};

@Injectable()
export class DtmQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	findRecentRequests() {
		return this.findRecentRequestsWithReferences();
	}

	private async findRecentRequestsWithReferences() {
		const requests = await this.drizzle.db.query.dtmIntegrationLog.findMany({
			columns: {
				id: true,
				status: true,
				createdAt: true,
				respondedAt: true,
				relatedEntityType: true,
				relatedEntityId: true,
				httpStatusCode: true,
				errorMessage: true,
				requestPayload: true,
				responsePayload: true,
			},
			extras: {
				durationSeconds: (table) => sql<number | null>`CASE
					WHEN ${table.respondedAt} IS NULL THEN NULL
					ELSE GREATEST(0, ROUND(
						EXTRACT(EPOCH FROM (${table.respondedAt} - ${table.createdAt}))
					))::integer
				END`,
			},
			with: {
				dtmRequestType: {
					columns: { name: true },
				},
			},
			orderBy: { createdAt: "desc", id: "desc" },
			limit: 100,
		});
		const orderIds = requests
			.filter((request) => request.relatedEntityType === "orders")
			.map((request) => request.relatedEntityId)
			.filter((id): id is number => id !== null);
		const programIds = requests
			.filter((request) => request.relatedEntityType === "forecast_programs")
			.map((request) => request.relatedEntityId)
			.filter((id): id is number => id !== null);
		const [orderReferences, programReferences] = await Promise.all([
			orderIds.length
				? this.drizzle.db
						.select({ id: orders.id, code: orders.orderNumber })
						.from(orders)
						.where(inArray(orders.id, orderIds))
				: [],
			programIds.length
				? this.drizzle.db
						.select({
							id: forecastPrograms.id,
							code: forecastPrograms.programNumber,
						})
						.from(forecastPrograms)
						.where(inArray(forecastPrograms.id, programIds))
				: [],
		]);
		const references = new Map<string, string>([
			...orderReferences.map(({ id, code }) => [`orders:${id}`, code] as const),
			...programReferences.map(
				({ id, code }) => [`forecast_programs:${id}`, code] as const,
			),
		]);

		return requests.map(({ errorMessage, ...request }) => ({
			...request,
			errorDetails: errorMessage,
			relatedEntityCode:
				request.relatedEntityType && request.relatedEntityId !== null
					? (references.get(
							`${request.relatedEntityType}:${request.relatedEntityId}`,
						) ?? null)
					: null,
		}));
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
	): Promise<DtmCompletion | false> {
		return this.completePendingRequest(requestId, result, "SIMULATOR");
	}

	async resolvePendingRequest(
		requestId: number,
		result: DtmSimulationResult,
		resolvedByUserId: number,
	): Promise<DtmCompletion | false> {
		return this.completePendingRequest(
			requestId,
			result,
			"MANUAL_SIMULATOR",
			resolvedByUserId,
		);
	}

	private async completePendingRequest(
		requestId: number,
		result: DtmSimulationResult,
		source: DtmResolutionSource,
		resolvedByUserId?: number,
	): Promise<DtmCompletion | false> {
		const accepted = result === "ACCEPTED";
		const respondedAt = new Date();

		return this.drizzle.db.transaction(async (tx) => {
			const [pending] = await tx
				.select({
					relatedEntityType: dtmIntegrationLog.relatedEntityType,
					relatedEntityId: dtmIntegrationLog.relatedEntityId,
					createdByUserId: dtmIntegrationLog.createdByUserId,
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
					respondedAt: sql<string>`CURRENT_TIMESTAMP`,
				})
				.where(
					and(
						eq(dtmIntegrationLog.id, requestId),
						eq(dtmIntegrationLog.status, "PENDING"),
					),
				);

			const actorUserId = resolvedByUserId ?? pending.createdByUserId;
			if (
				pending.relatedEntityType === "orders" &&
				pending.relatedEntityId !== null
			) {
				const [order] = await tx
					.select({
						statusId: orders.statusId,
						orderNumber: orders.orderNumber,
						createdByUserId: orders.createdByUserId,
					})
					.from(orders)
					.where(eq(orders.id, pending.relatedEntityId))
					.for("update");

				if (
					accepted &&
					actorUserId !== null &&
					order?.statusId === ORDER_STATUSES[OrderStatus.SENT_TO_DTM].id
				) {
					const nextStatusId = ORDER_STATUSES[OrderStatus.IN_PROGRESS].id;
					const [updatedOrder] = await tx
						.update(orders)
						.set({ statusId: nextStatusId })
						.where(
							and(
								eq(orders.id, pending.relatedEntityId),
								eq(orders.statusId, ORDER_STATUSES[OrderStatus.SENT_TO_DTM].id),
							),
						)
						.returning({ id: orders.id });
					if (updatedOrder) {
						await tx.insert(orderStatusHistory).values({
							orderId: pending.relatedEntityId as OrderId,
							statusId: nextStatusId,
							changedById: actorUserId,
							comment: "DTM accepted the submitted order",
						});
					}
				}

				return {
					relatedEntityType: pending.relatedEntityType,
					relatedEntityId: pending.relatedEntityId,
					relatedEntityCode: order?.orderNumber ?? null,
					createdByUserId: pending.createdByUserId,
					relatedEntityOwnerUserId: order?.createdByUserId ?? null,
				};
			}

			if (
				pending.relatedEntityType === "forecast_programs" &&
				pending.relatedEntityId !== null
			) {
				const [program] = await tx
					.select({
						statusId: forecastPrograms.statusId,
						programNumber: forecastPrograms.programNumber,
						createdByUserId: forecastPrograms.createdByUserId,
					})
					.from(forecastPrograms)
					.where(eq(forecastPrograms.id, pending.relatedEntityId))
					.for("update");
				const shouldStart =
					accepted &&
					actorUserId !== null &&
					program?.statusId === PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id;
				const nextStatusId = PROGRAM_STATUSES[ProgramStatus.IN_PROGRESS].id;
				const [updatedProgram] = await tx
					.update(forecastPrograms)
					.set({
						dtmStatus: result,
						...(shouldStart && { statusId: nextStatusId }),
					})
					.where(eq(forecastPrograms.id, pending.relatedEntityId))
					.returning({ id: forecastPrograms.id });
				if (shouldStart && program && updatedProgram) {
					await tx.insert(forecastProgramHistory).values({
						programId: pending.relatedEntityId,
						eventType: "STATUS_CHANGED",
						oldStatusId: program.statusId,
						newStatusId: nextStatusId,
						changedByUserId: actorUserId,
						reason: "DTM accepted the submitted program",
					});
				}
				return {
					relatedEntityType: pending.relatedEntityType,
					relatedEntityId: pending.relatedEntityId,
					relatedEntityCode: program?.programNumber ?? null,
					createdByUserId: pending.createdByUserId,
					relatedEntityOwnerUserId: program?.createdByUserId ?? null,
				};
			}

			return {
				relatedEntityType: pending.relatedEntityType,
				relatedEntityId: pending.relatedEntityId,
				relatedEntityCode: null,
				createdByUserId: pending.createdByUserId,
				relatedEntityOwnerUserId: null,
			};
		});
	}
}
