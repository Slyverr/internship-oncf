import { ClaimStatus, ClaimType, RejectionReason } from "@ecommand/shared";
import { createEnumReferenceMap } from "./reference-data.utils";

export const CLAIM_TYPES = createEnumReferenceMap("claim_types", ClaimType);

export const CLAIM_STATUSES = createEnumReferenceMap(
	"claim_statuses",
	ClaimStatus,
);

export const REJECTION_REASONS = createEnumReferenceMap(
	"rejection_reasons",
	RejectionReason,
);
