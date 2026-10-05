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

async function waitForMinio(endpoint: string, port: number): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	const healthUrl = `http://${endpoint}:${port}/minio/health/live`;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(healthUrl);
			if (response.ok) return;
		} catch {
			// MinIO may still be starting.
		}
		await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
	}

	throw new Error(`E2E MinIO did not become ready at ${healthUrl}`);
}

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required to wait for E2E services");
	}

	await waitForPostgres(databaseUrl);
	const minioEndpoint = process.env.MINIO_ENDPOINT;
	const minioPort = Number(process.env.MINIO_PORT);
	if (minioEndpoint && Number.isInteger(minioPort) && minioPort > 0) {
		await waitForMinio(minioEndpoint, minioPort);
	}
}

void main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
