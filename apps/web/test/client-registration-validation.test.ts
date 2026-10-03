import assert from "node:assert/strict";
import { validateRegistrationIdentity } from "@/lib/client-registration-validation";

assert.deepEqual(
	validateRegistrationIdentity({
		firstName: " ",
		lastName: "",
		customerCode: "",
		ice: "",
	}),
	{
		firstName: "required",
		lastName: "required",
		customerCode: "required",
		ice: "required",
	},
	"requires each company identity field",
);

assert.deepEqual(
	validateRegistrationIdentity({
		firstName: " Samira ",
		lastName: "El Amrani",
		customerCode: " LOCAL-REG-TEST ",
		ice: "123456789012345",
	}),
	{},
	"accepts trimmed names and a valid 15-digit ICE",
);

assert.deepEqual(
	validateRegistrationIdentity({
		firstName: "Samira",
		lastName: "El Amrani",
		customerCode: "LOCAL-REG-TEST",
		ice: "12345678901234x",
	}),
	{ ice: "format" },
	"rejects a malformed ICE without changing the other fields",
);

console.log("Client registration validation checks passed.");
