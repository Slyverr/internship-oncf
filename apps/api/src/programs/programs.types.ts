import { forecastPrograms } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Program = InferSelectModel<typeof forecastPrograms>;
export type ProgramId = Program["id"];
