import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const startupTimeoutMs = 60_000;
const requestTimeoutMs = 1_000;
const pollIntervalMs = 500;

type Fetcher = (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>;

export async function waitForApi(
	url: string,
	{
		timeoutMs = startupTimeoutMs,
		pollIntervalMs: intervalMs = pollIntervalMs,
		fetcher = fetch,
	}: {
		timeoutMs?: number;
		pollIntervalMs?: number;
		fetcher?: Fetcher;
	} = {},
) {
	const deadline = Date.now() + timeoutMs;
	let lastError = "API did not return a successful health response";

	while (Date.now() < deadline) {
		try {
			const response = await fetcher(url, {
				signal: AbortSignal.timeout(requestTimeoutMs),
			});
			if (response.ok) return;
			lastError = `API health endpoint returned HTTP ${response.status}`;
		} catch (error) {
			lastError = error instanceof Error ? error.message : String(error);
		}

		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}

	throw new Error(
		`API was not ready at ${url} after ${timeoutMs / 1_000}s (${lastError}). Start the API and check BACKEND_API_URL in apps/web/.env.`,
	);
}

async function main() {
	const workingDirectory = process.cwd();
	dotenv.config({
		path: [
			resolve(workingDirectory, ".env.local"),
			resolve(workingDirectory, ".env"),
		],
	});

	const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";
	const healthUrl = new URL("/health", backendUrl).toString();
	console.log(`Waiting for API health at ${healthUrl} (up to 60 seconds)…`);
	await waitForApi(healthUrl);
	console.log("API is ready; starting the web app.");
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	try {
		await main();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	}
}
