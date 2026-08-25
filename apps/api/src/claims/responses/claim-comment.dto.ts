import { Assert, Equals } from "@/common/utils/type-assertions";
import { ClaimComment } from "../claims.types";

type _Assertion = Assert<Equals<ClaimCommentDto, ClaimComment>>;

export class ClaimCommentDto implements ClaimComment {
	id: number;
	claimId: number;
	authorUserId: number;
	comment: string;
	createdAt: string;
}
