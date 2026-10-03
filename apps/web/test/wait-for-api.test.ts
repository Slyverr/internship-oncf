import assert from "node:assert/strict";
import { waitForApi } from "../../../scripts/wait-for-api";

let attempts = 0;
await waitForApi("http://localhost:8000/health", {
	timeoutMs: 100,
	pollIntervalMs: 0,
	fetcher: async () => {
		attempts += 1;
		return new Response(null, { status: attempts < 3 ? 503 : 200 });
	},
});
assert.equal(attempts, 3, "waits for a successful health response");

await assert.rejects(
	waitForApi("http://localhost:8000/health", {
		timeoutMs: 0,
		fetcher: async () => new Response(null, { status: 503 }),
	}),
	/API was not ready/,
);

console.log("API startup readiness checks passed.");
