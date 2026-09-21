import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	index,
	pgTable,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const attachments = pgTable(
	"attachments",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		hash: varchar("hash", { length: 64 }).notNull(),
		path: varchar("path", { length: 500 }).notNull(),
		fileSize: bigint("file_size", { mode: "number" }).notNull(),
		mimeType: varchar("mime_type", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("attachments_hash_key").on(table.hash),
		index("idx_attachments_created").on(table.createdAt),
	],
);
