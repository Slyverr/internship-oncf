import { Assert, Equals } from "src/common/utils/type-assertions";
import { ProgramDelete } from "../programs.types";

type _Assertion = Assert<Equals<ProgramDeleteDto, ProgramDelete>>;

export class ProgramDeleteDto implements ProgramDelete {
	id: number;
}
