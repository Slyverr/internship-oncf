import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
	throw new Error("DATABASE_URL is required for E2E database reset");

const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");
if (databaseName !== "ecommand_e2e") {
	throw new Error(`Refusing to reset a non-E2E database: ${databaseName}`);
}

async function resetDatabase() {
	const pool = new Pool({ connectionString: databaseUrl });
	try {
		await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
		console.log("Reset isolated E2E database schema");
	} finally {
		await pool.end();
	}
}

void resetDatabase().catch((error: unknown) => {
	console.error("E2E database reset failed:", error);
	process.exitCode = 1;
});
