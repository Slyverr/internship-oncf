import { ClaimStatus, OrderStatus, ProgramStatus } from "./enums";

export const ORDER_TRANSITIONS: Readonly<
	Record<OrderStatus, readonly OrderStatus[]>
> = {
	[OrderStatus.DRAFT]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],
	[OrderStatus.SUBMITTED]: [
		OrderStatus.APPROVED,
		OrderStatus.REJECTED,
		OrderStatus.CANCELLED,
	],
	[OrderStatus.APPROVED]: [OrderStatus.SENT_TO_DTM],
	[OrderStatus.SENT_TO_DTM]: [OrderStatus.IN_PROGRESS],
	[OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
	[OrderStatus.PARTIALLY_EXECUTED]: [],
	[OrderStatus.COMPLETED]: [],
	[OrderStatus.CANCELLED]: [],
	[OrderStatus.REJECTED]: [],
};

export const PROGRAM_TRANSITIONS: Readonly<
	Record<ProgramStatus, readonly ProgramStatus[]>
> = {
	[ProgramStatus.DRAFT]: [
		ProgramStatus.PENDING_APPROVAL,
		ProgramStatus.CANCELLED,
	],
	[ProgramStatus.PENDING_APPROVAL]: [
		ProgramStatus.APPROVED,
		ProgramStatus.CANCELLED,
	],
	[ProgramStatus.APPROVED]: [ProgramStatus.CONFIRMED, ProgramStatus.CANCELLED],
	[ProgramStatus.CONFIRMED]: [ProgramStatus.SENT_TO_DTM],
	[ProgramStatus.SENT_TO_DTM]: [ProgramStatus.IN_PROGRESS],
	[ProgramStatus.IN_PROGRESS]: [ProgramStatus.COMPLETED],
	[ProgramStatus.COMPLETED]: [],
	[ProgramStatus.CANCELLED]: [],
};

export const CLAIM_TRANSITIONS: Readonly<
	Record<ClaimStatus, readonly ClaimStatus[]>
> = {
	[ClaimStatus.NEW]: [ClaimStatus.IN_PROGRESS, ClaimStatus.REJECTED],
	[ClaimStatus.IN_PROGRESS]: [
		ClaimStatus.AWAITING_INFO,
		ClaimStatus.IN_TREATMENT,
		ClaimStatus.REJECTED,
		ClaimStatus.SENT_TO_DTM,
	],
	[ClaimStatus.AWAITING_INFO]: [
		ClaimStatus.IN_PROGRESS,
		ClaimStatus.IN_TREATMENT,
	],
	[ClaimStatus.IN_TREATMENT]: [
		ClaimStatus.RESOLVED,
		ClaimStatus.REJECTED,
		ClaimStatus.SENT_TO_DTM,
	],
	[ClaimStatus.RESOLVED]: [ClaimStatus.CLOSED, ClaimStatus.SENT_TO_DTM],
	[ClaimStatus.CLOSED]: [],
	[ClaimStatus.REJECTED]: [],
	[ClaimStatus.SENT_TO_DTM]: [],
};

export function isWorkflowTransitionAllowed<T extends string>(
	transitions: Partial<Record<T, readonly T[]>>,
	fromStatus: string | null | undefined,
	toStatus: T,
): boolean {
	return Boolean(
		fromStatus && transitions[fromStatus as T]?.includes(toStatus),
	);
}
