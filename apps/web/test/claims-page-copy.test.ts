import assert from "node:assert/strict";
import { Permission } from "@ecommand/shared";
import { Messages } from "../src/i18n";
import { getClaimsPageDescriptionKey } from "../src/lib/claims-page-copy";

function permissionLookup(...permissions: Permission[]) {
	const grants = new Set(permissions);
	return (permission: Permission) => grants.has(permission);
}

assert.equal(
	getClaimsPageDescriptionKey(
		permissionLookup(Permission.CLAIMS_UPDATE, Permission.CLAIMS_MANAGE_OTHER),
	),
	Messages.claims.managedDescription,
);
assert.equal(
	getClaimsPageDescriptionKey(
		permissionLookup(Permission.CLAIMS_READ, Permission.CLAIMS_ACTION_COMMENT),
	),
	Messages.claims.conversationDescription,
);
assert.equal(
	getClaimsPageDescriptionKey(permissionLookup(Permission.CLAIMS_READ)),
	Messages.claims.readOnlyDescription,
);

console.log("Claims page description permission checks passed.");
