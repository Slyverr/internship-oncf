import assert from "node:assert/strict";
import axios from "axios";
import { getFormErrorMessage } from "../src/lib/form-utils";
import { loadPageData } from "../src/lib/load-page-data";
import {
	isAccessDeniedApiError,
	sanitizeApiError,
} from "../src/lib/safe-api-error";

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
				code: "CONFLICT",
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
	"This action conflicts with the current record state.",
	"API errors are mapped from stable codes instead of server messages",
);
assert.equal(
	(safeResponseError as Error).message,
	"This action conflicts with the current record state.",
	"API response messages are ignored",
);
assert.equal(
	JSON.stringify(safeResponseError).includes(accessToken),
	false,
	"response payloads are reduced to their user-facing message",
);

const accessDeniedError = Object.assign(new Error("forbidden"), {
	isAxiosError: true,
	response: {
		status: 403,
		data: { code: "ACCESS_DENIED" },
	},
});
assert.equal(
	isAccessDeniedApiError(sanitizeApiError(accessDeniedError)),
	true,
	"access-denied page states are selected from the stable API code",
);
assert.equal(
	isAccessDeniedApiError(safeResponseError),
	false,
	"other API failures are not mistaken for access denial",
);
assert.equal(
	await loadPageData(Promise.reject(sanitizeApiError(accessDeniedError))),
	null,
	"server-rendered routes can show an access-denied state instead of crashing",
);
const pageLoadError = new Error("unexpected failure");
await assert.rejects(
	loadPageData(Promise.reject(pageLoadError)),
	pageLoadError,
	"unexpected route-data failures remain visible to the error boundary",
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
