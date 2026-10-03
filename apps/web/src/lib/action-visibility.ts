import {
	Permission,
	ProgramStatus,
	RegistrationStatus,
	RolePersona,
} from "@ecommand/shared";
import type { UserListDto } from "@/lib/api/generated.schemas";

export type DashboardQuickAction = {
	type: "order" | "claim";
	href: string;
};

export function getDashboardQuickActions(
	hasPermission: (permission: Permission) => boolean,
): DashboardQuickAction[] {
	const actions = [
		{
			permission: Permission.ORDERS_CREATE,
			type: "order",
			href: "/dashboard/orders/new",
		},
		{
			permission: Permission.CLAIMS_CREATE,
			type: "claim",
			href: "/dashboard/claims/new",
		},
	] as const;

	return actions
		.filter(({ permission }) => hasPermission(permission))
		.map(({ permission: _permission, ...action }) => action);
}

export function getPendingClientRegistrations(
	users: UserListDto[],
	canReviewUsers: boolean,
): UserListDto[] {
	if (!canReviewUsers) return [];

	return users
		.filter(
			(user) =>
				user.registrationStatus === RegistrationStatus.PENDING &&
				user.role?.persona === RolePersona.CLIENT_REPRESENTATIVE,
		)
		.sort(
			(first, second) =>
				first.createdAt.localeCompare(second.createdAt) || first.id - second.id,
		);
}

export function getUserAccountOverview(users: UserListDto[]) {
	const pendingUsers = users.filter(
		(user) => user.registrationStatus === RegistrationStatus.PENDING,
	);
	const activeUsers = users.filter(
		(user) =>
			user.isActive && user.registrationStatus !== RegistrationStatus.PENDING,
	);

	return {
		total: users.length,
		active: activeUsers.length,
		pending: pendingUsers.length,
		inactive: users.length - activeUsers.length - pendingUsers.length,
	};
}

export function hasAvailableActions(...actions: boolean[]): boolean {
	return actions.some(Boolean);
}

export function canSubmitRequiredText(
	value: string,
	isPending: boolean,
): boolean {
	return !isPending && value.trim().length > 0;
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
