import * as dotenv from "dotenv";
import { relations } from "drizzle/relations";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seedReferenceData } from "@/database/reference-data/reference-data.seeder";

dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool, relations: relations });

async function run() {
	console.log("Seeding reference data...");
	await seedReferenceData(db);
	console.log("Reference data seeded successfully");
	await pool.end();
}

run().catch((err) => {
	console.error("Seeding failed:", err);
	process.exit(1);
});
