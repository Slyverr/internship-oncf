import { ProgramStatus, RegistrationStatus } from "@ecommand/shared";

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
