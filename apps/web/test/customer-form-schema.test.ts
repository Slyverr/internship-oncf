import assert from "node:assert/strict";
import { createCustomerFormSchema } from "../src/components/customers/customer-form";
import {
	type MessageKey,
	Messages,
	type TypedMessageTranslator,
} from "../src/i18n";

const translateForTest = ((
	key: MessageKey,
	values: Record<string, string | number> = {},
) =>
	values.count === undefined
		? key
		: `${key}:${values.count}`) as TypedMessageTranslator;
const { schema, identitySchema, steps } =
	createCustomerFormSchema(translateForTest);

const invalidCompany = schema.safeParse({ companyName: "   " });
assert.equal(invalidCompany.success, false);
if (!invalidCompany.success) {
	assert.equal(
		invalidCompany.error.issues[0]?.message,
		Messages.customers.form.companyNameRequired,
		"schema validation messages come from the supplied translator",
	);
}

const invalidIdentity = identitySchema.safeParse({ companyName: "" });
assert.equal(invalidIdentity.success, false);
if (!invalidIdentity.success) {
	assert.equal(
		invalidIdentity.error.issues[0]?.message,
		Messages.customers.form.companyNameRequired,
		"step validation uses the same locale-bound schema",
	);
}

assert.equal(steps[0].title, Messages.customers.form.company);
assert.equal(steps[1].description, Messages.customers.form.contactDescription);

console.log("Customer form schema uses its active message translator.");
