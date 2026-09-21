import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	check,
	foreignKey,
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { users } from "./users";

export const programStatus = pgTable(
	"program_status",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("program_status_name_key").on(table.name),
		index("idx_program_status_name").on(table.name),
	],
);

export const forecastPrograms = pgTable(
	"forecast_programs",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		programNumber: varchar("program_number", { length: 30 }).notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		statusId: uuid("status_id").notNull(),
		plannedDate: timestamp("planned_date", { mode: "string" }).notNull(),
		quantityPlanned: numeric("quantity_planned", {
			precision: 18,
			scale: 3,
		}).notNull(),
		quantityRealized: numeric("quantity_realized", { precision: 18, scale: 3 }),
		deviationReason: text("deviation_reason"),
		realizedAt: timestamp("realized_at", { mode: "string" }),
		realizedByUserId: bigint("realized_by_user_id", { mode: "number" }),
		createdByUserId: bigint("created_by_user_id", { mode: "number" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		sentToDtmAt: timestamp("sent_to_dtm_at", { mode: "string" }),
		dtmStatus: varchar("dtm_status", { length: 50 }),
	},
	(table) => [
		unique("forecast_programs_program_number_key").on(table.programNumber),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "forecast_programs_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.statusId],
			foreignColumns: [programStatus.id],
			name: "forecast_programs_status_id_fkey",
		}),
		foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "forecast_programs_created_by_user_id_fkey",
		}),
		foreignKey({
			columns: [table.realizedByUserId],
			foreignColumns: [users.id],
			name: "forecast_programs_realized_by_user_id_fkey",
		}),
		index("idx_forecast_programs_order").on(table.orderId),
		index("idx_forecast_programs_status").on(table.statusId),
		index("idx_forecast_programs_date").on(table.plannedDate),
		index("idx_forecast_programs_user").on(table.createdByUserId),
		index("idx_forecast_programs_sent").on(table.sentToDtmAt),
		index("idx_forecast_programs_order_date").on(
			table.orderId,
			table.plannedDate,
			table.statusId,
		),
		index("idx_forecast_programs_dtm_sync")
			.on(table.sentToDtmAt, table.statusId)
			.where(sql`sent_to_dtm_at IS NOT NULL`),
		index("idx_fp_realized_at").on(table.realizedAt),
	],
);

export const forecastProgramHistory = pgTable(
	"forecast_program_history",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		programId: bigint("program_id", { mode: "number" }),
		eventType: varchar("event_type", { length: 50 }).notNull(),
		oldQuantity: numeric("old_quantity", { precision: 18, scale: 3 }),
		newQuantity: numeric("new_quantity", { precision: 18, scale: 3 }),
		oldStatusId: uuid("old_status_id"),
		newStatusId: uuid("new_status_id"),
		oldPlannedDate: timestamp("old_planned_date", { mode: "string" }),
		newPlannedDate: timestamp("new_planned_date", { mode: "string" }),
		quantityRealized: numeric("quantity_realized", { precision: 18, scale: 3 }),
		completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
		deviationReason: text("deviation_reason"),
		changedByName: varchar("changed_by_name", { length: 200 }),
		changedByUserId: bigint("changed_by_user_id", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		reason: text("reason"),
	},
	(table) => [
		foreignKey({
			columns: [table.programId],
			foreignColumns: [forecastPrograms.id],
			name: "forecast_program_history_program_id_fkey",
		}).onDelete("set null"),
		foreignKey({
			columns: [table.changedByUserId],
			foreignColumns: [users.id],
			name: "forecast_program_history_changed_by_user_id_fkey",
		}),
		foreignKey({
			columns: [table.oldStatusId],
			foreignColumns: [programStatus.id],
			name: "forecast_program_history_old_status_id_fkey",
		}),
		foreignKey({
			columns: [table.newStatusId],
			foreignColumns: [programStatus.id],
			name: "forecast_program_history_new_status_id_fkey",
		}),
		check(
			"forecast_program_history_event_type_check",
			sql`(${table.eventType})::text = ANY (ARRAY['CREATED'::text, 'QUANTITY_MODIFIED'::text, 'DATE_MODIFIED'::text, 'STATUS_CHANGED'::text, 'EXECUTION_RECORDED'::text, 'DELETED'::text])`,
		),
		index("idx_fp_history_program").on(table.programId),
		index("idx_fp_history_user").on(table.changedByUserId),
		index("idx_fp_history_date").on(table.changedAt),
		index("idx_fp_history_event_type").on(table.eventType),
		index("idx_fp_history_old_status").on(table.oldStatusId),
		index("idx_fp_history_new_status").on(table.newStatusId),
	],
);
