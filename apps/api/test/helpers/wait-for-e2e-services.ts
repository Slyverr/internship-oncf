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

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required to wait for E2E services");
	}

	await waitForPostgres(databaseUrl);
}

void main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
