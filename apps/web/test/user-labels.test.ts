import assert from "node:assert/strict";
import { RegistrationStatus, Role } from "@ecommand/shared";
import {
	formatRegistrationStatus,
	formatUserRole,
	formatUserType,
} from "../src/lib/user-labels";

assert.equal(formatUserRole(Role.ADMIN), "Administrator");
assert.equal(formatUserRole(Role.AGENT_COMMERCIAL), "Commercial agent");
assert.equal(
	formatUserRole(Role.CLIENT_REPRESENTATIVE),
	"Client representative",
);
assert.equal(formatUserRole(undefined), "—");
assert.equal(formatUserRole("Regional Operations"), "Regional Operations");
assert.equal(formatUserType("internal"), "Internal");
assert.equal(formatUserType("external"), "External");
assert.equal(formatUserType(null), "—");
assert.equal(formatUserType("A_NEW_TYPE"), "Unknown type");
assert.equal(
	formatRegistrationStatus(RegistrationStatus.PENDING),
	"Awaiting review",
);

console.log("User role and type label checks passed.");
