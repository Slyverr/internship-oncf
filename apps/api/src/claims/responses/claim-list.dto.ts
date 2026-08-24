import { Assert, Equals } from "src/common/utils/type-assertions";
import { ClaimList } from "../claims.types";

type _Assertion = Assert<Equals<ClaimListDto, ClaimList>>;

export class ClaimListDto implements ClaimList {
	id: number;
	description: string;
	createdAt: string;
	updatedAt: string;
	typeId: number;
	customerId: number;
	createdByUserId: number;
	statusId: number;
	orderId: number | null;
	operationId: number | null;
	priority: string | null;
	resolution: string | null;
	closedByUserId: number | null;
	closedAt: string | null;
	claimStatus: { id: number; name: string } | null;
	customer: { id: number; companyName: string } | null;
	createdByUser: { id: number; lastName: string; firstName: string } | null;
	order: { id: number; orderNumber: string | null } | null;
	accessoryOperation: { id: number; name: string } | null;
	claimType: { id: number; name: string } | null;
}
