import { forecastPrograms } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { ProgramsService } from "./programs.service";

export type Program = InferSelectModel<typeof forecastPrograms>;
export type ProgramInsert = InferInsertModel<typeof forecastPrograms>;
export type ProgramUpdate = Partial<ProgramInsert>;

export type ProgramId = Program["id"];

export type ProgramList = Awaited<
	ReturnType<ProgramsService["findAll"]>
>[number];
export type ProgramDetail = NonNullable<
	Awaited<ReturnType<ProgramsService["findOne"]>>
>;
export type ProgramDelete = NonNullable<
	Awaited<ReturnType<ProgramsService["remove"]>>
>;
