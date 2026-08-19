import { Assert, Equals } from "src/common/utils/type-assertions";
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
	programStatus: { id: number; name: string } | null;
	order: { id: number; orderNumber: string | null } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
}
