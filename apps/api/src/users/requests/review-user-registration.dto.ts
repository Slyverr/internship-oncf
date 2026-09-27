import { RegistrationStatus } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export const REGISTRATION_REVIEW_DECISIONS = [
	RegistrationStatus.APPROVED,
	RegistrationStatus.REJECTED,
] as const;

export type RegistrationReviewDecision =
	(typeof REGISTRATION_REVIEW_DECISIONS)[number];

export class ReviewUserRegistrationDto {
	@ApiProperty({ enum: REGISTRATION_REVIEW_DECISIONS })
	@IsIn(REGISTRATION_REVIEW_DECISIONS)
	status: RegistrationReviewDecision;
}
