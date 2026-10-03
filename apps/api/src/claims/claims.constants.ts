import { CLAIM_TRANSITIONS, ClaimStatus } from "@ecommand/shared";
import { CLAIM_STATUSES } from "@/database/reference-data";

export { CLAIM_TRANSITIONS as CLAIM_TRANSITION };

export const CLAIM_STATUS_BY_ID = Object.fromEntries(
	Object.entries(CLAIM_STATUSES).map(([name, value]) => [value.id, name]),
) as Record<number, ClaimStatus>;
