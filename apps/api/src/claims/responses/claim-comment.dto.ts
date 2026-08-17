import { ClaimComment } from "../claims.types";

export class ClaimCommentDto implements ClaimComment {
	id: number;
	claimId: number;
	userId: number;
	comment: string;
	createdAt: string;
}
