import { ClaimStatus } from "@ecommand/shared";
import { CLAIM_STATUSES } from "src/db/reference-data";

export const CLAIM_TRANSITION: Record<ClaimStatus, ClaimStatus[]> = {
	[ClaimStatus.NEW]: [ClaimStatus.IN_PROGRESS, ClaimStatus.REJECTED],
	[ClaimStatus.IN_PROGRESS]: [
		ClaimStatus.AWAITING_INFO,
		ClaimStatus.IN_TREATMENT,
	],
	[ClaimStatus.AWAITING_INFO]: [
		ClaimStatus.IN_PROGRESS,
		ClaimStatus.IN_TREATMENT,
	],
	[ClaimStatus.IN_TREATMENT]: [ClaimStatus.RESOLVED, ClaimStatus.REJECTED],
	[ClaimStatus.RESOLVED]: [ClaimStatus.CLOSED, ClaimStatus.SENT_TO_DTM],
	[ClaimStatus.CLOSED]: [],
	[ClaimStatus.REJECTED]: [],
	[ClaimStatus.SENT_TO_DTM]: [],
};

export const CLAIM_STATUS_BY_ID = Object.fromEntries(
	Object.entries(CLAIM_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, ClaimStatus>;
