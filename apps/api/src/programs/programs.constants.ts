import { PROGRAM_TRANSITIONS, ProgramStatus } from "@ecommand/shared";
import { PROGRAM_STATUSES } from "@/database/reference-data";

export { PROGRAM_TRANSITIONS as PROGRAM_TRANSITION };

export const PROGRAM_STATUS_BY_ID = Object.fromEntries(
	Object.entries(PROGRAM_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, ProgramStatus>;
