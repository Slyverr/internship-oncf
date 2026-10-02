import assert from "node:assert/strict";
import {
	CUSTOMER_ICE_LENGTH,
	CUSTOMER_ICE_PATTERN,
	isValidCustomerIce,
} from "@ecommand/shared";

assert.equal(CUSTOMER_ICE_LENGTH, 15);
assert.equal(CUSTOMER_ICE_PATTERN.source, "^\\d{15}$");
assert.equal(isValidCustomerIce("123456789012345"), true);
assert.equal(isValidCustomerIce("12345678901234"), false);
assert.equal(isValidCustomerIce("1234567890123456"), false);
assert.equal(isValidCustomerIce("12345678901234A"), false);
assert.equal(isValidCustomerIce(" 12345678901234"), false);

console.log("Customer ICE format is shared and consistent.");
