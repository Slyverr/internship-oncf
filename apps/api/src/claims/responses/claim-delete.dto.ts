import { Assert, Equals } from "@/common/utils/type-assertions";
import { ClaimDelete } from "../claims.types";

type _Assertion = Assert<Equals<ClaimDeleteDto, ClaimDelete>>;

export class ClaimDeleteDto implements ClaimDelete {
	id: number;
}
