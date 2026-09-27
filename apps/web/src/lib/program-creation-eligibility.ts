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
