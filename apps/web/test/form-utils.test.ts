import assert from "node:assert/strict";
import { getFormErrorMessage } from "../src/lib/form-utils";

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
console.log("Form error formatter checks passed.");
