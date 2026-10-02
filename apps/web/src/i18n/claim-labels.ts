import { ClaimPriority, ClaimType } from "@ecommand/shared";
import { type AppLocale, type MessageKey, Messages, translate } from ".";
import { getClaimStatusLabel } from "./status-labels";

const claimTypeKeys: Record<ClaimType, MessageKey> = {
	[ClaimType.DELIVERY_DELAY]: Messages.claims.types.deliveryDelay,
	[ClaimType.DAMAGED_GOODS]: Messages.claims.types.damagedGoods,
	[ClaimType.INCORRECT_QUANTITY]: Messages.claims.types.incorrectQuantity,
	[ClaimType.NON_COMPLIANT_QUALITY]: Messages.claims.types.nonCompliantQuality,
	[ClaimType.BILLING_ISSUE]: Messages.claims.types.billingIssue,
	[ClaimType.DOCUMENTATION_PROBLEM]: Messages.claims.types.documentationProblem,
	[ClaimType.CUSTOMER_SERVICE]: Messages.claims.types.customerService,
	[ClaimType.OTHER]: Messages.claims.types.other,
};

const claimPriorityKeys: Record<ClaimPriority, MessageKey> = {
	[ClaimPriority.LOW]: Messages.claims.priorities.low,
	[ClaimPriority.MEDIUM]: Messages.claims.priorities.medium,
	[ClaimPriority.HIGH]: Messages.claims.priorities.high,
	[ClaimPriority.URGENT]: Messages.claims.priorities.urgent,
};

export function getClaimTypeLabel(
	value: ClaimType | string,
	locale?: AppLocale,
): string {
	return value in claimTypeKeys
		? translate(claimTypeKeys[value as ClaimType], {}, locale)
		: translate(Messages.claims.types.unknown, {}, locale);
}

export function getClaimPriorityLabel(
	value: ClaimPriority | string,
	locale?: AppLocale,
): string {
	return value in claimPriorityKeys
		? translate(claimPriorityKeys[value as ClaimPriority], {}, locale)
		: translate(Messages.claims.priorities.unknown, {}, locale);
}

export { getClaimStatusLabel };
