import { ProgramStatus } from "@ecommand/shared";

export class CreateProgramResponseDto {
	id: number;
	orderId: number;
	userId: number;
	programNumber: string;
	statusId: number;
	status: ProgramStatus;
	plannedDate: string;
	quantityPlanned: string;
	quantityRealized?: string;
	dtmStatus?: string;
	createdBy: number;
	realizedBy?: number;
	createdAt: string;
	updatedAt: string;
}
