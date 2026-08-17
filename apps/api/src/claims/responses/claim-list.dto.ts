import { ClaimList } from "../claims.types";

export class ClaimListDto implements ClaimList {
	id: number;
	createdAt: string;
	description: string;
	updatedAt: string;
	typeId: number;
	customerId: number;
	userId: number;
	statusId: number;
	orderId: number | null;
	operationId: number | null;
	priority: string | null;
	resolution: string | null;
	closedBy: number | null;
	closedAt: string | null;
	claimStatus: { id: number; name: string } | null;
	claimComments: {
		id: number;
		createdAt: string;
		userId: number;
		comment: string;
		claimId: number;
	}[];
	customer: { id: number; companyName: string } | null;
	claimStatusHistories: {
		id: number;
		statusId: number;
		changedBy: number;
		changedAt: string;
		comment: string | null;
		claimId: number;
	}[];
	user: { id: number; lastName: string; firstName: string } | null;
	order: { id: number; orderNumber: string | null } | null;
	accessoryOperation: { id: number; name: string } | null;
	claimType: { id: number; name: string } | null;
	closedByUser: { id: number; lastName: string; firstName: string } | null;
}
