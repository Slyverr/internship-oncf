import { Assert, Equals } from "@/common/utils/type-assertions";
import { ClaimDetail } from "../claims.types";

type _Assertion = Assert<Equals<ClaimDetailDto, ClaimDetail>>;

export class ClaimDetailDto implements ClaimDetail {
	id: number;
	customerId: number;
	createdByUserId: number;
	orderId: number | null;
	operationId: string | null;
	typeId: string;
	statusId: string;
	priority: string | null;
	description: string;
	resolution: string | null;
	createdAt: string;
	updatedAt: string;
	closedByUserId: number | null;
	closedAt: string | null;
	claimStatus: { id: string; name: string } | null;
	claimComments: {
		id: number;
		createdAt: string;
		comment: string;
		claimId: number;
		authorUserId: number;
	}[];
	customer: { id: number; companyName: string } | null;
	claimStatusHistories: {
		id: number;
		statusId: string;
		changedAt: string;
		comment: string | null;
		changedByUserId: number;
		claimId: number;
	}[];
	createdByUser: { id: number; lastName: string; firstName: string } | null;
	order: { id: number; orderNumber: string } | null;
	accessoryOperation: { id: string; name: string } | null;
	claimType: { id: string; name: string } | null;
	closedByUser: { id: number; lastName: string; firstName: string } | null;
}
