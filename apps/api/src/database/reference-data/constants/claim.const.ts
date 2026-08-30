import { ClaimStatus, ClaimType, RejectionReason } from "@ecommand/shared";
import {
	createReferenceMap,
	enumReferenceMapper,
} from "../reference-data.utils";

export const CLAIM_TYPES_SCOPE = "claim_types";
export const CLAIM_STATUSES_SCOPE = "claim_statuses";
export const REJECTION_REASONS_SCOPE = "rejection_reasons";

export const CLAIM_TYPES = createReferenceMap(
	ClaimType,
	enumReferenceMapper(CLAIM_TYPES_SCOPE),
);

export const CLAIM_STATUSES = createReferenceMap(
	ClaimStatus,
	enumReferenceMapper(CLAIM_STATUSES_SCOPE),
);

export const REJECTION_REASONS = createReferenceMap(
	RejectionReason,
	enumReferenceMapper(REJECTION_REASONS_SCOPE),
);
