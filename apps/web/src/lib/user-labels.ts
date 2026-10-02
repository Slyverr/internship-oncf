import { RegistrationStatus, Role } from "@ecommand/shared";
import { type AppLocale, type MessageKey, Messages, translate } from "@/i18n";

const roleLabelKeys: Record<Role, Parameters<typeof translate>[0]> = {
	[Role.ADMIN]: Messages.users.roles.admin,
	[Role.AGENT_COMMERCIAL]: Messages.users.roles.agentCommercial,
	[Role.CLIENT_REPRESENTATIVE]: Messages.users.roles.clientRepresentative,
};

const userTypeLabelKeys = {
	internal: Messages.users.types.internal,
	external: Messages.users.types.external,
} as const;

const registrationStatusLabelKeys: Record<string, MessageKey> = {
	[RegistrationStatus.PENDING]: Messages.users.list.awaitingReview,
	[RegistrationStatus.APPROVED]: Messages.users.list.approved,
	[RegistrationStatus.REJECTED]: Messages.users.list.rejected,
};

export function formatUserRole(
	role: string | null | undefined,
	locale?: AppLocale,
) {
	if (!role) return "—";
	const key = roleLabelKeys[role as Role];
	return key ? translate(key, {}, locale) : role;
}

export function formatUserType(
	type: string | null | undefined,
	locale?: AppLocale,
) {
	if (!type) return "—";
	const key = userTypeLabelKeys[type as keyof typeof userTypeLabelKeys];
	return translate(key ?? Messages.users.types.unknown, {}, locale);
}

export function formatRegistrationStatus(status: string, locale?: AppLocale) {
	return translate(
		registrationStatusLabelKeys[status] ??
			Messages.users.list.unknownReviewStatus,
		{},
		locale,
	);
}
