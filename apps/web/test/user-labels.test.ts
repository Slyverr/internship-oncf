import assert from "node:assert/strict";
import { Role } from "@ecommand/shared";
import { formatUserRole, formatUserType } from "../src/lib/user-labels";

assert.equal(formatUserRole(Role.ADMIN), "Administrator");
assert.equal(formatUserRole(Role.AGENT_COMMERCIAL), "Commercial agent");
assert.equal(
	formatUserRole(Role.CLIENT_REPRESENTATIVE),
	"Client representative",
);
assert.equal(formatUserRole(undefined), "—");
assert.equal(formatUserRole("A_NEW_ROLE"), "A New Role");
assert.equal(formatUserType("internal"), "Internal");
assert.equal(formatUserType("external"), "External");
assert.equal(formatUserType(null), "—");

console.log("User role and type label checks passed.");
