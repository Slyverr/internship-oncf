import assert from "node:assert/strict";
import { getEligibleOrderId } from "../src/lib/program-creation-eligibility";

const eligibleOrders = [
	{ id: 42, orderNumber: "ORD-ABCDEFGHIJ" },
	{ id: 43, orderNumber: "ORD-KLMNOPQRST" },
];

assert.equal(
	getEligibleOrderId("ORD-KLMNOPQRST", eligibleOrders),
	43,
	"resolve the URL's public order number to the internal form relation value",
);
assert.equal(
	getEligibleOrderId("ORD-DOESNOTEXIST", eligibleOrders),
	0,
	"leave the order selection empty when the public code is not eligible",
);
assert.equal(
	getEligibleOrderId(undefined, eligibleOrders),
	0,
	"leave the order selection empty when no code was supplied",
);

console.log("Program creation selection checks passed.");
