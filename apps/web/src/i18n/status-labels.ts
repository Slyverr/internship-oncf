import { ClaimStatus, OrderStatus, ProgramStatus } from "@ecommand/shared";
import {
	type AppLocale,
	type MessageKeyWithoutPlaceholders,
	Messages,
	translate,
} from ".";

const orderStatusKeys: Record<OrderStatus, MessageKeyWithoutPlaceholders> = {
	[OrderStatus.DRAFT]: Messages.statuses.order.DRAFT,
	[OrderStatus.SUBMITTED]: Messages.statuses.order.SUBMITTED,
	[OrderStatus.APPROVED]: Messages.statuses.order.APPROVED,
	[OrderStatus.REJECTED]: Messages.statuses.order.REJECTED,
	[OrderStatus.IN_PROGRESS]: Messages.statuses.order.IN_PROGRESS,
	[OrderStatus.PARTIALLY_EXECUTED]: Messages.statuses.order.PARTIALLY_EXECUTED,
	[OrderStatus.COMPLETED]: Messages.statuses.order.COMPLETED,
	[OrderStatus.CANCELLED]: Messages.statuses.order.CANCELLED,
	[OrderStatus.SENT_TO_DTM]: Messages.statuses.order.SENT_TO_DTM,
};

const programStatusKeys: Record<ProgramStatus, MessageKeyWithoutPlaceholders> =
	{
		[ProgramStatus.DRAFT]: Messages.statuses.program.DRAFT,
		[ProgramStatus.PENDING_APPROVAL]:
			Messages.statuses.program.PENDING_APPROVAL,
		[ProgramStatus.APPROVED]: Messages.statuses.program.APPROVED,
		[ProgramStatus.SENT_TO_DTM]: Messages.statuses.program.SENT_TO_DTM,
		[ProgramStatus.CONFIRMED]: Messages.statuses.program.CONFIRMED,
		[ProgramStatus.IN_PROGRESS]: Messages.statuses.program.IN_PROGRESS,
		[ProgramStatus.COMPLETED]: Messages.statuses.program.COMPLETED,
		[ProgramStatus.CANCELLED]: Messages.statuses.program.CANCELLED,
	};

const claimStatusKeys: Record<ClaimStatus, MessageKeyWithoutPlaceholders> = {
	[ClaimStatus.NEW]: Messages.statuses.claim.NEW,
	[ClaimStatus.IN_PROGRESS]: Messages.statuses.claim.IN_PROGRESS,
	[ClaimStatus.AWAITING_INFO]: Messages.statuses.claim.AWAITING_INFO,
	[ClaimStatus.IN_TREATMENT]: Messages.statuses.claim.IN_TREATMENT,
	[ClaimStatus.RESOLVED]: Messages.statuses.claim.RESOLVED,
	[ClaimStatus.CLOSED]: Messages.statuses.claim.CLOSED,
	[ClaimStatus.REJECTED]: Messages.statuses.claim.REJECTED,
	[ClaimStatus.SENT_TO_DTM]: Messages.statuses.claim.SENT_TO_DTM,
};

function labelStatus<Status extends string>(
	keys: Record<Status, MessageKeyWithoutPlaceholders>,
	value: string | null | undefined,
	unknownKey: MessageKeyWithoutPlaceholders = Messages.statuses.unknown,
	locale?: AppLocale,
) {
	if (!value) {
		return unknownKey === Messages.statuses.unknown
			? "—"
			: translate(unknownKey, {}, locale);
	}
	return value in keys
		? translate(keys[value as Status], {}, locale)
		: translate(unknownKey, {}, locale);
}

export const getOrderStatusLabel = (
	value: string | null | undefined,
	locale?: AppLocale,
) => labelStatus(orderStatusKeys, value, undefined, locale);

export const getProgramStatusLabel = (
	value: string | null | undefined,
	locale?: AppLocale,
) => labelStatus(programStatusKeys, value, undefined, locale);

export const getClaimStatusLabel = (
	value: string | null | undefined,
	locale?: AppLocale,
) => labelStatus(claimStatusKeys, value, undefined, locale);

export const getOrderNotificationStatusLabel = (
	value?: string,
	locale?: AppLocale,
) =>
	labelStatus(
		orderStatusKeys,
		value,
		Messages.notifications.messages.unknownStatus,
		locale,
	);

export const getProgramNotificationStatusLabel = (
	value?: string,
	locale?: AppLocale,
) =>
	labelStatus(
		programStatusKeys,
		value,
		Messages.notifications.messages.unknownStatus,
		locale,
	);

export const getClaimNotificationStatusLabel = (
	value?: string,
	locale?: AppLocale,
) =>
	labelStatus(
		claimStatusKeys,
		value,
		Messages.notifications.messages.unknownStatus,
		locale,
	);
