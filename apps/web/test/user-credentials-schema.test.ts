import assert from "node:assert/strict";
import { translate } from "../src/i18n";
import { createUserCredentialsSchema } from "../src/lib/user-credentials-schema";

const schema = createUserCredentialsSchema(translate);

const empty = schema.safeParse({ email: "", password: "" });
assert.equal(empty.success, false);
if (!empty.success) {
	assert.deepEqual(
		empty.error.issues.map(({ path, message }) => [path[0], message]),
		[
			["email", "Email address is required."],
			["password", "Password is required."],
		],
		"blank credentials show required-field messages",
	);
}

const malformedEmail = schema.safeParse({
	email: "not-an-email",
	password: "valid-password",
});
assert.equal(malformedEmail.success, false);
if (!malformedEmail.success) {
	assert.equal(
		malformedEmail.error.issues[0]?.message,
		"Enter a valid email address.",
		"non-empty malformed email shows a format message",
	);
}

const shortPassword = schema.safeParse({
	email: "user@oncf.ma",
	password: "short",
});
assert.equal(shortPassword.success, false);
if (!shortPassword.success) {
	assert.equal(
		shortPassword.error.issues[0]?.message,
		"Password must be at least 8 characters.",
		"short non-empty password shows its length requirement",
	);
}

assert.equal(
	schema.safeParse({ email: "user@oncf.ma", password: "secure-pass-123" })
		.success,
	true,
	"valid credentials pass schema validation",
);

console.log("User credential validation checks passed.");
