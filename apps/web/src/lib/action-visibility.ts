import {
	Permission,
	ProgramStatus,
	RegistrationStatus,
} from "@ecommand/shared";

export type DashboardQuickAction = {
	type: "order" | "claim";
	label: string;
	href: string;
};

export function getDashboardQuickActions(
	hasPermission: (permission: Permission) => boolean,
): DashboardQuickAction[] {
	const actions = [
		{
			permission: Permission.ORDERS_CREATE,
			type: "order",
			label: "Create order",
			href: "/dashboard/orders/new",
		},
		{
			permission: Permission.CLAIMS_CREATE,
			type: "claim",
			label: "Create claim",
			href: "/dashboard/claims/new",
		},
	] as const;

	return actions
		.filter(({ permission }) => hasPermission(permission))
		.map(({ permission: _permission, ...action }) => action);
}

export function hasAvailableActions(...actions: boolean[]): boolean {
	return actions.some(Boolean);
}

export function canDeleteProgram(
	status: string,
	hasDeletePermission: boolean,
): boolean {
	return hasDeletePermission && status === ProgramStatus.DRAFT;
}

export function canReviewRegistration(
	status: string,
	hasUserUpdatePermission: boolean,
	isClientRepresentative: boolean,
): boolean {
	return (
		hasUserUpdatePermission &&
		isClientRepresentative &&
		status === RegistrationStatus.PENDING
	);
}
