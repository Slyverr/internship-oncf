import { ApiProperty } from "@nestjs/swagger";

export class ClaimCommentDto {
	id: number;
	claimId: number;
	authorUserId: number;
	@ApiProperty({ example: "Alex Morgan", nullable: true })
	authorName: string | null;
	comment: string;
	createdAt: string;
}
