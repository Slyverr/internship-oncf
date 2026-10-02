import assert from "node:assert/strict";
import { API_ERROR_CODES, OrderStatus } from "@ecommand/shared";
import {
	getFirstFormStepErrorField,
	getFormErrorMessage,
} from "../src/lib/form-utils";
import { canCreateProgramForOrder } from "../src/lib/program-creation-eligibility";

assert.equal(
	getFormErrorMessage({
		message: "Request failed with status code 400",
		response: {
			status: 400,
			data: { code: API_ERROR_CODES.VALIDATION_FAILED },
		},
	}),
	"Please check the entered values and try again.",
	"API validation codes map to localized client copy",
);

assert.equal(
	getFormErrorMessage({
		message: "Request failed with status code 400",
		response: {
			status: 400,
			data: {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				details: { fields: {} },
			},
		},
	}),
	"Please check the entered values and try again.",
	"validation feedback does not rely on server-authored strings",
);

assert.equal(
	getFormErrorMessage({
		message: "email must be valid",
		response: {
			status: 400,
			data: {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				details: {
					fields: {
						email: ["IS_EMAIL"],
						password: ["MATCHES", "MIN_LENGTH"],
					},
				},
			},
		},
	}),
	"Review these fields: Email: Enter a valid email address; Password: Use the required format, The text is too short",
	"field validation rule codes map to localized client copy",
);

assert.equal(
	getFormErrorMessage({
		response: {
			status: 400,
			data: {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				details: { fields: { ice: ["IS_NOT_EMPTY"] } },
			},
		},
	}),
	"Review these fields: ICE: This field is required",
	"technical API field names map to catalog labels",
);

assert.equal(
	getFormErrorMessage({
		response: {
			status: 400,
			data: {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				details: { fields: { profile: ["UNRECOGNIZED_RULE"] } },
			},
		},
	}),
	"Please check the entered values and try again.",
	"unknown API field names never leak as untranslated property names",
);

assert.equal(
	getFormErrorMessage(new Error("Network unavailable")),
	"The request could not be completed. Please try again.",
	"unknown exceptions use a catalog fallback instead of arbitrary error text",
);
assert.equal(
	getFormErrorMessage({
		isAxiosError: true,
		code: "ERR_NETWORK",
		message: "Network Error",
	}),
	"The ECommand API could not be reached.",
	"transport errors use localized feedback instead of raw Axios text",
);
assert.equal(
	getFormErrorMessage({
		isAxiosError: true,
		code: "ERR_CANCELED",
		message: "Request was canceled.",
	}),
	"Request was canceled.",
	"canceled requests use the catalog message after Axios sanitization",
);
assert.equal(
	getFormErrorMessage({
		isAxiosError: true,
		message: "Request failed with status code 500",
		response: {
			status: 500,
			data: { message: "Internal server failure with stack details" },
		},
	}),
	"Something went wrong. Please try again.",
	"unstructured server messages are not displayed to users",
);
assert.equal(
	getFormErrorMessage("Invalid form"),
	"The request could not be completed. Please try again.",
	"unstructured string errors never bypass the catalog",
);
assert.equal(
	getFormErrorMessage(["Email is invalid", "Name is required"]),
	"The request could not be completed. Please try again.",
	"unstructured string arrays never bypass the catalog",
);
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
