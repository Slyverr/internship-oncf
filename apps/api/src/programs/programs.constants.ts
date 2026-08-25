import { ProgramStatus } from "@ecommand/shared";
import { PROGRAM_STATUSES } from "src/database/reference-data";

export const PROGRAM_TRANSITION: Record<ProgramStatus, ProgramStatus[]> = {
	[ProgramStatus.DRAFT]: [
		ProgramStatus.PENDING_APPROVAL,
		ProgramStatus.CANCELLED,
	],

	[ProgramStatus.PENDING_APPROVAL]: [
		ProgramStatus.APPROVED,
		ProgramStatus.CONFIRMED,
	],

	[ProgramStatus.APPROVED]: [ProgramStatus.SENT_TO_DTM],

	[ProgramStatus.SENT_TO_DTM]: [ProgramStatus.IN_PROGRESS],

	[ProgramStatus.IN_PROGRESS]: [
		ProgramStatus.COMPLETED,
		ProgramStatus.CANCELLED,
	],

	[ProgramStatus.CONFIRMED]: [],
	[ProgramStatus.COMPLETED]: [],
	[ProgramStatus.CANCELLED]: [],
};

export const PROGRAM_STATUS_BY_ID = Object.fromEntries(
	Object.entries(PROGRAM_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, ProgramStatus>;
