import assert from "node:assert/strict";
import { API_TRANSPORT_ERROR_CODES } from "@ecommand/shared";
import {
	isApiUnavailableError,
	shouldRetryApiRequest,
} from "../src/lib/api-availability";

assert.equal(
	isApiUnavailableError({
		response: {
			status: 503,
			data: { code: API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE },
		},
	}),
	true,
	"recognized proxy outages are marked for automatic recovery",
);
assert.equal(
	isApiUnavailableError({
		response: { status: 503, data: { code: "INTERNAL_ERROR" } },
	}),
	false,
	"ordinary server errors do not trigger API recovery polling",
);

assert.equal(shouldRetryApiRequest(0, new Error("network")), true);
assert.equal(shouldRetryApiRequest(1, new Error("network")), true);
assert.equal(shouldRetryApiRequest(2, new Error("network")), false);
assert.equal(shouldRetryApiRequest(0, { response: { status: 503 } }), true);
assert.equal(shouldRetryApiRequest(0, { response: { status: 429 } }), true);
assert.equal(shouldRetryApiRequest(0, { response: { status: 400 } }), false);
assert.equal(shouldRetryApiRequest(0, { response: { status: 401 } }), false);

console.log("API availability and retry checks passed.");
