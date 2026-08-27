import { Assert, Equals } from "@/common/utils/type-assertions";
import { ClaimList } from "../claims.types";

type _Assertion = Assert<Equals<ClaimListDto, ClaimList>>;

export class ClaimListDto implements ClaimList {
	id: number;
	description: string;
	createdAt: string;
	updatedAt: string;
	typeId: string;
	customerId: number;
	createdByUserId: number;
	statusId: string;
	orderId: number | null;
	operationId: string | null;
	priority: string | null;
	resolution: string | null;
	closedByUserId: number | null;
	closedAt: string | null;
	claimStatus: { id: string; name: string } | null;
	customer: { id: number; companyName: string } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
	order: { id: number; orderNumber: string } | null;
	accessoryOperation: { id: string; name: string } | null;
	claimType: { id: string; name: string } | null;
}
