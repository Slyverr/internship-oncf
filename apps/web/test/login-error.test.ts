import assert from "node:assert/strict";
import { API_ERROR_CODES } from "@ecommand/shared";
import { Messages } from "../src/i18n";
import { getLoginErrorKey } from "../src/lib/login-error";

function apiError(code: string) {
	return Object.assign(new Error("API failure"), {
		isAxiosError: true,
		response: { data: { code } },
	});
}

assert.equal(
	getLoginErrorKey(apiError(API_ERROR_CODES.AUTHENTICATION_REQUIRED)),
	Messages.auth.login.invalidCredentials,
);
assert.equal(
	getLoginErrorKey(apiError(API_ERROR_CODES.RATE_LIMITED)),
	Messages.auth.login.tooManyAttempts,
);
assert.equal(
	getLoginErrorKey(apiError(API_ERROR_CODES.INTERNAL_ERROR)),
	Messages.auth.login.serverError,
);
assert.equal(
	getLoginErrorKey(
		Object.assign(new Error("Network failure"), { isAxiosError: true }),
	),
	Messages.auth.login.networkError,
);
assert.equal(
	getLoginErrorKey(apiError("UNRECOGNIZED_CODE")),
	Messages.apiError.requestFailed,
);
assert.equal(
	getLoginErrorKey(new Error("Unexpected failure")),
	Messages.apiError.requestFailed,
);

console.log("Login API error-code mapping checks passed.");
