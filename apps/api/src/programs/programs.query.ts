import { QueryColumns, QueryRelations } from "src/db/drizzle.types";

type ProgramsColumns = QueryColumns<"forecastPrograms">;
type ProgramsRelations = QueryRelations<"forecastPrograms">;

export const programListColumns = {
	id: true,
	programNumber: true,
	plannedDate: true,
	quantityPlanned: true,
	quantityRealized: true,
	createdAt: true,
	sentToDtmAt: true,
} satisfies ProgramsColumns;

export const programListRelations = {
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

export const programDetailRelations = {
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
