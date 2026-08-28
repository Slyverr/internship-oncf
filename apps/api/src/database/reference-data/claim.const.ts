import { ClaimStatus, ClaimType, RejectionReason } from "@ecommand/shared";
import {
	createReferenceMap,
	enumReferenceMapper,
} from "./reference-data.utils";

export const CLAIM_TYPES = createReferenceMap(
	ClaimType,
	enumReferenceMapper("claim_types"),
);

export const CLAIM_STATUSES = createReferenceMap(
	ClaimStatus,
	enumReferenceMapper("claim_statuses"),
);

export const REJECTION_REASONS = createReferenceMap(
	RejectionReason,
	enumReferenceMapper("rejection_reasons"),
);
