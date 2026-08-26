import { forecastPrograms } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import type { DrizzleDb } from "@/database/drizzle.types";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { ProgramId, ProgramInsert, ProgramUpdate } from "./programs.types";

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

export async function createProgram(db: DrizzleDb, values: ProgramInsert) {
	const [created] = await withDbErrorHandling(
		() =>
			db
				.insert(forecastPrograms)
				.values(values)
				.returning({ id: forecastPrograms.id }),
		values,
	);

	return created;
}

export async function findPrograms(
	db: DrizzleDb,
	where: Partial<{ createdByUserId: number }>,
) {
	return db.query.forecastPrograms.findMany({
		where,
		columns: programListColumns,
		with: programListRelations,
	});
}

export async function findProgram(db: DrizzleDb, id: ProgramId) {
	return db.query.forecastPrograms.findFirst({
		where: { id },
		with: programDetailRelations,
	});
}

export async function findProgramForOwnership(db: DrizzleDb, id: ProgramId) {
	return db.query.forecastPrograms.findFirst({
		where: { id },
		columns: {
			createdByUserId: true,
		},
	});
}

export async function updateProgram(
	db: DrizzleDb,
	id: ProgramId,
	values: ProgramUpdate,
	where: SQL = eq(forecastPrograms.id, id),
) {
	const [updated] = await withDbErrorHandling(
		() =>
			db
				.update(forecastPrograms)
				.set(values)
				.where(where)
				.returning({ id: forecastPrograms.id }),
		values,
	);

	return updated;
}

export async function removeProgram(db: DrizzleDb, id: ProgramId) {
	const [deleted] = await db
		.delete(forecastPrograms)
		.where(eq(forecastPrograms.id, id))
		.returning({ id: forecastPrograms.id });

	return deleted;
}

export async function findProgramStatus(db: DrizzleDb, id: ProgramId) {
	return db.query.forecastPrograms.findFirst({
		where: { id },
		columns: {
			statusId: true,
		},
	});
}
