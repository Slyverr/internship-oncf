import { Client } from "pg";

const timeoutMs = 30_000;
const retryDelayMs = 250;

async function waitForPostgres(databaseUrl: string): Promise<void> {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const client = new Client({ connectionString: databaseUrl });
		try {
			await client.connect();
			await client.query("select 1");
			await client.end();
			return;
		} catch {
			await client.end().catch(() => undefined);
			await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
		}
	}

	throw new Error("E2E PostgreSQL did not become ready within 30 seconds");
}

async function waitForObjectStorage(endpoint: string): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	const healthUrl = new URL("/", endpoint).toString();

	while (Date.now() < deadline) {
		try {
			const response = await fetch(healthUrl);
			if (response.status < 500) return;
		} catch {
			// Object storage may still be starting.
		}
		await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
	}

	throw new Error(`E2E object storage did not become ready at ${healthUrl}`);
}

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required to wait for E2E services");
	}

	await waitForPostgres(databaseUrl);
	const objectStorageEndpoint = process.env.OBJECT_STORAGE_ENDPOINT;
	if (objectStorageEndpoint) {
		await waitForObjectStorage(objectStorageEndpoint);
	}
}

void main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
