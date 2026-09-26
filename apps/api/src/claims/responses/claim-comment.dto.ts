import { ApiProperty } from "@nestjs/swagger";

export class ClaimCommentDto {
	id: number;
	claimId: number;
	authorUserId: number;
	@ApiProperty({ example: "Alex Morgan" })
	authorName: string;
	comment: string;
	createdAt: string;
}
