import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	check,
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const archivalExecutionLog = pgTable(
	"archival_execution_log",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		tableName: varchar("table_name", { length: 100 }).notNull(),
		recordsArchived: integer("records_archived").default(0).notNull(),
		cutoffDate: timestamp("cutoff_date", { mode: "string" }).notNull(),
		executionStatus: varchar("execution_status", { length: 20 }).notNull(),
		errorMessage: text("error_message"),
		startedAt: timestamp("started_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		completedAt: timestamp("completed_at", { mode: "string" }),
		triggeredBy: varchar("triggered_by", { length: 50 }).notNull(),
		triggeredByUserId: bigint("triggered_by_user_id", { mode: "number" }),
	},
	(table) => [
		foreignKey({
			columns: [table.triggeredByUserId],
			foreignColumns: [users.id],
			name: "archival_execution_log_triggered_by_user_id_fkey",
		}),
		check(
			"archival_execution_log_execution_status_check",
			sql`(${table.executionStatus})::text = ANY (ARRAY['SUCCESS'::text, 'FAILED'::text, 'IN_PROGRESS'::text])`,
		),
		check(
			"archival_execution_log_triggered_by_check",
			sql`(${table.triggeredBy})::text = ANY (ARRAY['SCHEDULED'::text, 'MANUAL'::text])`,
		),
		index("idx_archival_log_table").on(table.tableName),
		index("idx_archival_log_status").on(table.executionStatus),
		index("idx_archival_log_started").on(table.startedAt),
		index("idx_archival_log_triggered").on(table.triggeredBy),
	],
);
