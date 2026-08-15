import { ClaimPriority, ClaimStatus, ClaimType } from "@ecommand/shared";

export class UpdateClaimResponseDto {
	id: number;
	customerId: number;
	userId: number;
	orderId?: number;
	operationId?: number;
	typeId: number;
	type: ClaimType;
	statusId: number;
	status: ClaimStatus;
	priority?: ClaimPriority;
	description: string;
	resolution?: string;
	closedBy?: number;
	closedAt?: string;
	createdAt: string;
	updatedAt: string;
}
