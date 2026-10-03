import { Permission } from "@ecommand/shared";
import { type MessageKey, Messages } from "@/i18n";

export function getClaimsPageDescriptionKey(
	hasPermission: (permission: Permission) => boolean,
): MessageKey {
	if (
		hasPermission(Permission.CLAIMS_UPDATE) &&
		hasPermission(Permission.CLAIMS_MANAGE_OTHER)
	) {
		return Messages.claims.managedDescription;
	}

	if (hasPermission(Permission.CLAIMS_ACTION_COMMENT)) {
		return Messages.claims.conversationDescription;
	}

	return Messages.claims.readOnlyDescription;
}
