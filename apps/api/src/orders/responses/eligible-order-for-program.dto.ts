import { Assert, Equals } from "src/common/utils/type-assertions";
import { OrdersService } from "../orders.service";

type EligibleOrderForProgram = Awaited<
	ReturnType<OrdersService["findEligibleForPrograms"]>
>[number];

type _Assertion = Assert<
	Equals<EligibleOrderForProgramDto, EligibleOrderForProgram>
>;

export class EligibleOrderForProgramDto implements EligibleOrderForProgram {
	id: number;
	orderNumber: string | null;
	quantityDemanded: string;
}
