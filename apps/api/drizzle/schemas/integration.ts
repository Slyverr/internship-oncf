import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	check,
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const dtmRequestTypes = pgTable(
	"dtm_request_types",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("dtm_request_types_name_key").on(table.name),
		index("idx_dtm_request_types_name").on(table.name),
		index("idx_dtm_request_types_active").on(table.isActive),
	],
);

export const dtmIntegrationLog = pgTable(
	"dtm_integration_log",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		requestTypeId: uuid("request_type_id").notNull(),
		requestPayload: text("request_payload"),
		responsePayload: text("response_payload"),
		status: varchar("status", { length: 20 }).notNull(),
		httpStatusCode: integer("http_status_code"),
		errorMessage: text("error_message"),
		durationMs: integer("duration_ms"),
		relatedEntityType: varchar("related_entity_type", { length: 50 }),
		relatedEntityId: bigint("related_entity_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		createdByUserId: bigint("created_by_user_id", { mode: "number" }),
		retryCount: integer("retry_count").default(0).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.requestTypeId],
			foreignColumns: [dtmRequestTypes.id],
			name: "dtm_integration_log_request_type_id_fkey",
		}),
		foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "dtm_integration_log_created_by_user_id_fkey",
		}),
		check(
			"dtm_integration_log_status_check",
			sql`(${table.status})::text = ANY (ARRAY['SUCCESS'::text, 'FAILED'::text, 'TIMEOUT'::text, 'PENDING'::text])`,
		),
		index("idx_dtm_integration_log_type").on(table.requestTypeId),
		index("idx_dtm_integration_log_status").on(table.status),
		index("idx_dtm_integration_log_entity").on(
			table.relatedEntityType,
			table.relatedEntityId,
		),
		index("idx_dtm_integration_log_created").on(table.createdAt),
		index("idx_dtm_integration_log_user").on(table.createdByUserId),
		index("idx_dtm_integration_log_http").on(table.httpStatusCode),
		index("idx_dtm_log_entity_date").on(
			table.relatedEntityType,
			table.relatedEntityId,
			table.createdAt,
		),
		index("idx_dtm_log_failed")
			.on(table.status, table.createdAt)
			.where(
				sql`(status)::text = ANY (ARRAY['FAILED'::text, 'TIMEOUT'::text])`,
			),
		index("idx_dtm_log_performance").on(
			table.requestTypeId,
			table.durationMs,
			table.createdAt,
		),
	],
);
