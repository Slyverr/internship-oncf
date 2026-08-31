import { Permission } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
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

	async createProgram(values: ProgramInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(forecastPrograms)
					.values(values)
					.returning({ id: forecastPrograms.id }),
			values,
		);
		return created;
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

		const createdByUserId = hasOnePermission(
			user,
			Permission.PROGRAMS_MANAGE_OTHER,
		)
			? userId
			: user.id;

		return this.drizzle.db.query.forecastPrograms.findMany({
			where: {
				...(createdByUserId !== undefined && { createdByUserId }),
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
		});
	}

	async updateProgram(
		id: ProgramId,
		values: ProgramUpdate,
		where: SQL = eq(forecastPrograms.id, id),
	) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(forecastPrograms)
					.set(values)
					.where(where)
					.returning({ id: forecastPrograms.id }),
			values,
		);
		return updated;
	}

	async removeProgram(id: ProgramId) {
		const [deleted] = await this.drizzle.db
			.delete(forecastPrograms)
			.where(eq(forecastPrograms.id, id))
			.returning({ id: forecastPrograms.id });
		return deleted;
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
