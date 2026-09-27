import assert from "node:assert/strict";
import axios from "axios";
import { getFormErrorMessage } from "../src/lib/form-utils";
import { sanitizeApiError } from "../src/lib/safe-api-error";

const accessToken = "local-test-access-token";
const transportError = Object.assign(new Error("connect ECONNREFUSED"), {
	code: "ECONNREFUSED",
	isAxiosError: true,
	config: { headers: { Authorization: `Bearer ${accessToken}` } },
	request: { _header: `Authorization: Bearer ${accessToken}` },
});
const safeTransportError = sanitizeApiError(transportError) as Error & {
	code?: string;
	request?: unknown;
	config?: unknown;
};

assert.equal(
	safeTransportError.message,
	"The ECommand API could not be reached.",
	"transport errors use a credential-free message",
);
assert.equal(safeTransportError.code, "ECONNREFUSED");
assert.equal(safeTransportError.config, undefined);
assert.equal(safeTransportError.request, undefined);
assert.equal(safeTransportError.stack?.includes(accessToken), false);

const responseError = Object.assign(
	new Error("Request failed with status code 409"),
	{
		isAxiosError: true,
		config: { headers: { Authorization: `Bearer ${accessToken}` } },
		request: { _header: `Authorization: Bearer ${accessToken}` },
		response: {
			status: 409,
			data: {
				message: "This order already has a forecast program",
				debug: accessToken,
			},
		},
	},
);
const safeResponseError = sanitizeApiError(responseError);

assert.equal(
	axios.isAxiosError(safeResponseError),
	true,
	"sanitized API failures retain Axios error compatibility",
);
assert.equal(
	getFormErrorMessage(safeResponseError),
	"This order already has a forecast program",
	"server validation messages remain available to forms",
);
assert.equal(
	JSON.stringify(safeResponseError).includes(accessToken),
	false,
	"response payloads are reduced to their user-facing message",
);

const canceledError = Object.assign(new Error("canceled"), {
	code: "ERR_CANCELED",
	isAxiosError: true,
});
assert.equal(
	(sanitizeApiError(canceledError) as Error).message,
	"Request was canceled.",
	"request cancellation is not misreported as an API outage",
);

console.log("API error sanitization checks passed.");
