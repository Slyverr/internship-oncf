import { OrderStatus } from "@ecommand/shared";

const eligibleOrderStatuses = new Set<string>([
	OrderStatus.APPROVED,
	OrderStatus.SENT_TO_DTM,
	OrderStatus.IN_PROGRESS,
]);

export function canCreateProgramForOrder({
	canCreate,
	canManageOther,
	createdByUserId,
	currentUserId,
	orderStatus,
	programCount,
}: {
	canCreate: boolean;
	canManageOther: boolean;
	createdByUserId: number;
	currentUserId: number;
	orderStatus: string;
	programCount: number;
}): boolean {
	return (
		canCreate &&
		(canManageOther || createdByUserId === currentUserId) &&
		eligibleOrderStatuses.has(orderStatus) &&
		programCount === 0
	);
}

export function shouldClearInitialOrderSelection({
	initialOrderId,
	selectedOrderId,
	eligibleOrderIds,
	isLoading,
	isFetching,
	isError,
}: {
	initialOrderId?: number;
	selectedOrderId: number;
	eligibleOrderIds: number[];
	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;
}): boolean {
	return (
		initialOrderId !== undefined &&
		selectedOrderId === initialOrderId &&
		!isLoading &&
		!isFetching &&
		!isError &&
		!eligibleOrderIds.includes(initialOrderId)
	);
}
