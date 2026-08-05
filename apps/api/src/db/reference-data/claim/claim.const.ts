import { ClaimStatus, ClaimType, RejectionReason } from "./claim.enum";

export const CLAIM_TYPES: Record<ClaimType, { id: number; name: ClaimType }> = {
	[ClaimType.DELIVERY_DELAY]: { id: 1, name: ClaimType.DELIVERY_DELAY },
	[ClaimType.DAMAGED_GOODS]: { id: 2, name: ClaimType.DAMAGED_GOODS },
	[ClaimType.INCORRECT_QUANTITY]: { id: 3, name: ClaimType.INCORRECT_QUANTITY },
	[ClaimType.NON_COMPLIANT_QUALITY]: {
		id: 4,
		name: ClaimType.NON_COMPLIANT_QUALITY,
	},
	[ClaimType.BILLING_ISSUE]: { id: 5, name: ClaimType.BILLING_ISSUE },
	[ClaimType.DOCUMENTATION_PROBLEM]: {
		id: 6,
		name: ClaimType.DOCUMENTATION_PROBLEM,
	},
	[ClaimType.CUSTOMER_SERVICE]: { id: 7, name: ClaimType.CUSTOMER_SERVICE },
	[ClaimType.OTHER]: { id: 8, name: ClaimType.OTHER },
};

export const CLAIM_STATUSES: Record<
	ClaimStatus,
	{ id: number; name: ClaimStatus }
> = {
	[ClaimStatus.NEW]: { id: 1, name: ClaimStatus.NEW },
	[ClaimStatus.IN_PROGRESS]: { id: 2, name: ClaimStatus.IN_PROGRESS },
	[ClaimStatus.AWAITING_INFO]: { id: 3, name: ClaimStatus.AWAITING_INFO },
	[ClaimStatus.IN_TREATMENT]: { id: 4, name: ClaimStatus.IN_TREATMENT },
	[ClaimStatus.RESOLVED]: { id: 5, name: ClaimStatus.RESOLVED },
	[ClaimStatus.CLOSED]: { id: 6, name: ClaimStatus.CLOSED },
	[ClaimStatus.REJECTED]: { id: 7, name: ClaimStatus.REJECTED },
	[ClaimStatus.SENT_TO_DTM]: { id: 8, name: ClaimStatus.SENT_TO_DTM },
};

export const REJECTION_REASONS: Record<
	RejectionReason,
	{ id: number; name: RejectionReason }
> = {
	[RejectionReason.INSUFFICIENT_CAPACITY]: {
		id: 1,
		name: RejectionReason.INSUFFICIENT_CAPACITY,
	},
	[RejectionReason.INCOMPLETE_DOCUMENTATION]: {
		id: 2,
		name: RejectionReason.INCOMPLETE_DOCUMENTATION,
	},
	[RejectionReason.INCORRECT_INFORMATION]: {
		id: 3,
		name: RejectionReason.INCORRECT_INFORMATION,
	},
	[RejectionReason.UNAUTHORIZED_CUSTOMER]: {
		id: 4,
		name: RejectionReason.UNAUTHORIZED_CUSTOMER,
	},
	[RejectionReason.UNAUTHORIZED_GOODS]: {
		id: 5,
		name: RejectionReason.UNAUTHORIZED_GOODS,
	},
	[RejectionReason.PAYMENT_ISSUE]: {
		id: 6,
		name: RejectionReason.PAYMENT_ISSUE,
	},
	[RejectionReason.OPERATIONAL_CONSTRAINTS]: {
		id: 7,
		name: RejectionReason.OPERATIONAL_CONSTRAINTS,
	},
	[RejectionReason.OTHER]: { id: 8, name: RejectionReason.OTHER },
};
