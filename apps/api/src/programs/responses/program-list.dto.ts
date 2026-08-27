import { Assert, Equals } from "@/common/utils/type-assertions";
import { ProgramList } from "../programs.types";

type _Assertion = Assert<Equals<ProgramListDto, ProgramList>>;

export class ProgramListDto implements ProgramList {
	id: number;
	createdAt: string;
	quantityRealized: string | null;
	plannedDate: string;
	quantityPlanned: string;
	sentToDtmAt: string | null;
	programNumber: string;
	programStatus: { id: string; name: string } | null;
	order: { id: number; orderNumber: string } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
}
