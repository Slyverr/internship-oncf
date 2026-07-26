import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "../../drizzle/relations"; // adjust path

@Injectable()
export class DrizzleService implements OnModuleDestroy {
	public db: NodePgDatabase<typeof relations>;
	private pool: Pool;

	constructor(private config: ConfigService) {
		this.pool = new Pool({
			connectionString: this.config.get("DATABASE_URL"),
		});
		this.db = drizzle({ client: this.pool, relations });
	}

	async onModuleDestroy() {
		await this.pool.end();
	}
}
