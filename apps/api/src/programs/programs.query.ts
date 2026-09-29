import { Permission } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { forecastProgramHistory, forecastPrograms } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { ProgramId, ProgramInsert, ProgramUpdate } from "./programs.types";
import { ListProgramQueryDto } from "./requests/list-program.dto";

type ProgramsColumns = QueryColumns<"forecastPrograms">;
type ProgramsRelations = QueryRelations<"forecastPrograms">;

const programListColumns = {
	id: true,
	programNumber: true,
	plannedDate: true,
	quantityPlanned: true,
	quantityRealized: true,
	createdAt: true,
	sentToDtmAt: true,
} satisfies ProgramsColumns;

const programListRelations = {
	programStatus: {
		columns: {
			id: true,
			name: true,
		},
	},
	order: {
		columns: {
			id: true,
			orderNumber: true,
		},
	},
	createdByUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
} satisfies ProgramsRelations;

const programDetailRelations = {
	...programListRelations,
	realizedByUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
	forecastProgramHistories: true,
	orderWagons: true,
	programConvois: true,
} satisfies ProgramsRelations;

@Injectable()
export class ProgramsQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createProgram(
		values: ProgramInsert,
		history: { userId: number; userName: string },
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const [created] = await withDbErrorHandling(
				() =>
					tx
						.insert(forecastPrograms)
						.values(values)
						.returning({ id: forecastPrograms.id }),
				values,
			);
			await withDbErrorHandling(
				() =>
					tx.insert(forecastProgramHistory).values({
						programId: created.id,
						eventType: "CREATED",
						newQuantity: values.quantityPlanned,
						newStatusId: values.statusId,
						newPlannedDate: values.plannedDate,
						changedByName: history.userName,
						changedByUserId: history.userId,
					}),
				values,
			);
			return created;
		});
	}

	async findPrograms(user: AuthUser, query: ListProgramQueryDto) {
		const {
			page = 1,
			limit = 10,
			search,
			orderId,
			userId,
			status,
			dtmStatus,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = query;

		const customerScope = getCustomerScope(user);
		const managesOther = hasOnePermission(
			user,
			Permission.PROGRAMS_MANAGE_OTHER,
		);
		const createdByUserId =
			customerScope === null ? (managesOther ? userId : user.id) : undefined;

		return this.drizzle.db.query.forecastPrograms.findMany({
			where: {
				...(createdByUserId !== undefined && { createdByUserId }),
				...(customerScope !== null && {
					order: {
						customerId:
							customerScope.length === 1
								? customerScope[0]
								: { in: [...customerScope] },
					},
				}),
				...(orderId !== undefined && { orderId }),
				...(status && {
					programStatus: {
						name: status,
					},
				}),
				...(dtmStatus && { dtmStatus }),
				...(search && {
					programNumber: {
						ilike: `%${search}%`,
					},
				}),
			},
			columns: programListColumns,
			with: programListRelations,
			orderBy: {
				[sortBy]: sortOrder,
			},
			limit,
			offset: (page - 1) * limit,
		});
	}

	async findProgramForOrder(orderId: number) {
		return this.drizzle.db.query.forecastPrograms.findFirst({
			where: { orderId },
			columns: { id: true },
		});
	}

	async findOrderCustomer(orderId: number) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id: orderId },
			columns: { customerId: true },
			with: {
				orderStatus: { columns: { name: true } },
			},
		});
	}

	async findProgram(id: ProgramId) {
		return this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			with: programDetailRelations,
		});
	}

	async findProgramForOwnership(id: ProgramId) {
		return this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			columns: {
				createdByUserId: true,
			},
			with: {
				order: {
					columns: {
						customerId: true,
					},
				},
			},
		});
	}

	async updateProgram(
		id: ProgramId,
		values: ProgramUpdate,
		where: SQL = eq(forecastPrograms.id, id),
		history?: { userId: number; userName: string },
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const previous = history
				? await tx.query.forecastPrograms.findFirst({
						where: { id },
						columns: {
							quantityPlanned: true,
							quantityRealized: true,
							deviationReason: true,
							plannedDate: true,
							statusId: true,
						},
					})
				: undefined;
			const [updated] = await withDbErrorHandling(
				() =>
					tx
						.update(forecastPrograms)
						.set(values)
						.where(where)
						.returning({ id: forecastPrograms.id }),
				values,
			);
			if (!updated) return undefined;

			if (previous && history) {
				const events = this.buildUpdateHistory(previous, values, id, history);
				for (const event of events) {
					await withDbErrorHandling(
						() => tx.insert(forecastProgramHistory).values(event),
						event,
					);
				}
			}
			return updated;
		});
	}

	async removeProgram(
		id: ProgramId,
		history: { userId: number; userName: string },
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const program = await tx.query.forecastPrograms.findFirst({
				where: { id },
				columns: {
					quantityPlanned: true,
					quantityRealized: true,
					statusId: true,
					plannedDate: true,
				},
			});
			if (!program) return undefined;
			await withDbErrorHandling(
				() =>
					tx.insert(forecastProgramHistory).values({
						programId: id,
						eventType: "DELETED",
						oldQuantity: program.quantityPlanned,
						oldStatusId: program.statusId,
						oldPlannedDate: program.plannedDate,
						changedByName: history.userName,
						changedByUserId: history.userId,
					}),
				{ id, history },
			);
			const [deleted] = await tx
				.delete(forecastPrograms)
				.where(eq(forecastPrograms.id, id))
				.returning({ id: forecastPrograms.id });
			return deleted;
		});
	}

	private buildUpdateHistory(
		previous: {
			quantityPlanned: string;
			quantityRealized: string | null;
			deviationReason: string | null;
			plannedDate: string;
			statusId: string;
		},
		values: ProgramUpdate,
		programId: ProgramId,
		history: { userId: number; userName: string },
	) {
		const actor = {
			programId,
			changedByName: history.userName,
			changedByUserId: history.userId,
		};
		const events: (typeof forecastProgramHistory.$inferInsert)[] = [];
		if (
			values.statusId !== undefined &&
			values.statusId !== previous.statusId
		) {
			events.push({
				...actor,
				eventType: "STATUS_CHANGED",
				oldStatusId: previous.statusId,
				newStatusId: values.statusId,
			});
		}
		if (
			values.quantityPlanned !== undefined &&
			values.quantityPlanned !== previous.quantityPlanned
		) {
			events.push({
				...actor,
				eventType: "QUANTITY_MODIFIED",
				oldQuantity: previous.quantityPlanned,
				newQuantity: values.quantityPlanned,
			});
		}
		if (
			values.plannedDate !== undefined &&
			values.plannedDate !== previous.plannedDate
		) {
			events.push({
				...actor,
				eventType: "DATE_MODIFIED",
				oldPlannedDate: previous.plannedDate,
				newPlannedDate: values.plannedDate,
			});
		}
		if (
			(values.quantityRealized !== undefined &&
				values.quantityRealized !== previous.quantityRealized) ||
			values.deviationReason !== undefined
		) {
			const quantityRealized =
				values.quantityRealized ?? previous.quantityRealized;
			const plannedQuantity = Number(previous.quantityPlanned);
			const completionRate =
				quantityRealized === null || plannedQuantity <= 0
					? null
					: ((Number(quantityRealized) / plannedQuantity) * 100).toFixed(2);
			events.push({
				...actor,
				eventType: "EXECUTION_RECORDED",
				quantityRealized,
				completionRate,
				deviationReason: values.deviationReason ?? previous.deviationReason,
			});
		}
		return events;
	}

	async findProgramStatus(id: ProgramId) {
		return this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});
	}
}
