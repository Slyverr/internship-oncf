import { Assert, Equals } from "src/common/utils/type-assertions";
import { ProgramDetail } from "../programs.types";

type _Assertion = Assert<Equals<ProgramDetailDto, ProgramDetail>>;

export class ProgramDetailDto implements ProgramDetail {
	id: number;
	orderId: number;
	statusId: number;
	plannedDate: string;
	quantityPlanned: string;
	createdBy: number;
	createdAt: string;
	updatedAt: string;
	sentToDtmAt: string | null;
	quantityRealized: string | null;
	deviationReason: string | null;
	realizedAt: string | null;
	realizedBy: number | null;
	programNumber: string;
	dtmStatus: string | null;
	programStatus: { id: number; name: string } | null;
	orderWagons: {
		id: number;
		orderId: number;
		createdAt: string;
		trainId: number | null;
		wagonId: number;
		quantityLoaded: string | null;
		forecastProgramId: number | null;
	}[];
	forecastProgramHistories: {
		id: number;
		quantityRealized: string | null;
		deviationReason: string | null;
		programId: number | null;
		oldQuantity: string | null;
		newQuantity: string | null;
		changedBy: number;
		changedAt: string;
		reason: string | null;
		eventType: string;
		oldStatusId: number | null;
		newStatusId: number | null;
		oldPlannedDate: string | null;
		newPlannedDate: string | null;
		completionRate: string | null;
		changedByName: string | null;
	}[];
	order: { id: number; orderNumber: string | null } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
	realizedByUser: { id: number; lastName: string; firstName: string } | null;
	programConvois: {
		id: number;
		createdAt: string;
		updatedAt: string;
		status: string | null;
		trainId: number;
		forecastProgramId: number;
		lastLatitude: string | null;
		lastLongitude: string | null;
		convoy: string;
		since: string | null;
		quantity: string | null;
		unit: string | null;
		wagonCount: number | null;
		eta: string | null;
		delayMinutes: number | null;
	}[];
}
