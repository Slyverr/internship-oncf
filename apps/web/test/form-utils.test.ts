import assert from "node:assert/strict";
import { OrderStatus } from "@ecommand/shared";
import {
	getFirstFormStepErrorField,
	getFormErrorMessage,
} from "../src/lib/form-utils";
import { canCreateProgramForOrder } from "../src/lib/program-creation-eligibility";

assert.equal(
	getFormErrorMessage({
		message: "Request failed with status code 400",
		response: { data: { message: "Customer is required" } },
	}),
	"Customer is required",
	"API validation details take precedence over transport messages",
);

assert.equal(
	getFormErrorMessage({
		response: { data: { message: ["Email is invalid", "Name is required"] } },
	}),
	"Email is invalid. Name is required",
	"API validation arrays are joined for display",
);

assert.equal(
	getFormErrorMessage(new Error("Network unavailable")),
	"Network unavailable",
	"ordinary error messages are preserved",
);
assert.equal(getFormErrorMessage("Invalid form"), "Invalid form");
assert.equal(getFormErrorMessage(undefined), undefined);
assert.equal(getFormErrorMessage(null), undefined);
assert.equal(
	getFirstFormStepErrorField([
		{ path: [], message: "Invalid form" },
		{ path: ["orderId"], message: "Order is required" },
		{ path: ["plannedDate"], message: "Date is required" },
	]),
	"orderId",
	"the first named field with a validation issue receives focus",
);
assert.equal(
	getFirstFormStepErrorField([{ path: [], message: "Invalid form" }]),
	undefined,
	"root-level issues do not focus a nonexistent field",
);
console.log("Form error formatter checks passed.");

const baseEligibility = {
	canCreate: true,
	canManageOther: false,
	createdByUserId: 7,
	currentUserId: 7,
	orderStatus: OrderStatus.APPROVED,
	programCount: 0,
};
for (const orderStatus of [
	OrderStatus.APPROVED,
	OrderStatus.SENT_TO_DTM,
	OrderStatus.IN_PROGRESS,
]) {
	assert.equal(
		canCreateProgramForOrder({ ...baseEligibility, orderStatus }),
		true,
		"eligible order status allows the action",
	);
}
for (const orderStatus of [
	OrderStatus.DRAFT,
	OrderStatus.SUBMITTED,
	OrderStatus.REJECTED,
	OrderStatus.CANCELLED,
	OrderStatus.COMPLETED,
]) {
	assert.equal(
		canCreateProgramForOrder({ ...baseEligibility, orderStatus }),
		false,
		"ineligible order status hides the action",
	);
}
assert.equal(
	canCreateProgramForOrder({ ...baseEligibility, canCreate: false }),
	false,
	"users without create permission cannot see the action",
);
assert.equal(
	canCreateProgramForOrder({ ...baseEligibility, createdByUserId: 8 }),
	false,
	"users cannot create programs from another user's order",
);
assert.equal(
	canCreateProgramForOrder({
		...baseEligibility,
		canManageOther: true,
		createdByUserId: 8,
	}),
	true,
	"managers can create programs from another user's order",
);
assert.equal(
	canCreateProgramForOrder({ ...baseEligibility, programCount: 1 }),
	false,
	"orders with existing programs do not offer duplicate creation",
);
console.log("Program creation eligibility checks passed.");
