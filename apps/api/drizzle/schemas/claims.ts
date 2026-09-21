import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	check,
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { attachments } from "./attachments";
import { customers } from "./customers";
import { orders } from "./orders";
import { accessoryOperations } from "./reference-data";
import { users } from "./users";

export const claimTypes = pgTable(
	"claim_types",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("claim_types_name_key").on(table.name),
		index("idx_claim_types_name").on(table.name),
	],
);

export const claimStatus = pgTable(
	"claim_status",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("claim_status_name_key").on(table.name),
		index("idx_claim_status_name").on(table.name),
	],
);

export const claims = pgTable(
	"claims",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		customerId: bigint("customer_id", { mode: "number" }).notNull(),
		createdByUserId: bigint("created_by_user_id", { mode: "number" }).notNull(),
		orderId: bigint("order_id", { mode: "number" }),
		operationId: uuid("operation_id"),
		typeId: uuid("type_id").notNull(),
		statusId: uuid("status_id").notNull(),
		priority: varchar("priority", { length: 20 }),
		description: text("description").notNull(),
		resolution: varchar("resolution", { length: 1000 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		closedByUserId: bigint("closed_by_user_id", { mode: "number" }),
		closedAt: timestamp("closed_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "claims_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "claims_created_by_user_id_fkey",
		}),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "claims_order_id_fkey",
		}),
		foreignKey({
			columns: [table.operationId],
			foreignColumns: [accessoryOperations.id],
			name: "claims_operation_id_fkey",
		}),
		foreignKey({
			columns: [table.typeId],
			foreignColumns: [claimTypes.id],
			name: "claims_type_id_fkey",
		}),
		foreignKey({
			columns: [table.statusId],
			foreignColumns: [claimStatus.id],
			name: "claims_status_id_fkey",
		}),
		foreignKey({
			columns: [table.closedByUserId],
			foreignColumns: [users.id],
			name: "claims_closed_by_user_id_fkey",
		}),
		check(
			"claims_priority_check",
			sql`(${table.priority})::text = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])`,
		),
		index("idx_claims_customer").on(table.customerId),
		index("idx_claims_created_by_user").on(table.createdByUserId),
		index("idx_claims_order").on(table.orderId),
		index("idx_claims_operation").on(table.operationId),
		index("idx_claims_type").on(table.typeId),
		index("idx_claims_status").on(table.statusId),
		index("idx_claims_priority").on(table.priority),
		index("idx_claims_created").on(table.createdAt),
		index("idx_claims_closed").on(table.closedAt),
		index("idx_claims_customer_status").on(
			table.customerId,
			table.statusId,
			table.createdAt,
		),
		index("idx_claims_order_status")
			.on(table.orderId, table.statusId)
			.where(sql`order_id IS NOT NULL`),
		index("idx_claims_priority_status").on(
			table.priority,
			table.statusId,
			table.createdAt,
		),
	],
);

export const claimStatusHistory = pgTable(
	"claim_status_history",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		statusId: uuid("status_id").notNull(),
		changedByUserId: bigint("changed_by_user_id", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		comment: text("comment"),
	},
	(table) => [
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_status_history_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.statusId],
			foreignColumns: [claimStatus.id],
			name: "claim_status_history_status_id_fkey",
		}),
		foreignKey({
			columns: [table.changedByUserId],
			foreignColumns: [users.id],
			name: "claim_status_history_changed_by_user_id_fkey",
		}),
		index("idx_claim_status_history_claim").on(table.claimId),
		index("idx_claim_status_history_status").on(table.statusId),
		index("idx_claim_status_history_user").on(table.changedByUserId),
		index("idx_claim_status_history_date").on(table.changedAt),
	],
);

export const claimFiles = pgTable(
	"claim_files",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		attachmentId: bigint("attachment_id", { mode: "number" }).notNull(),
		fileName: varchar("file_name", { length: 255 }).notNull(),
		description: varchar("description", { length: 500 }),
		uploadedByUserId: bigint("uploaded_by_user_id", {
			mode: "number",
		}).notNull(),
		uploadedAt: timestamp("uploaded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		deletedAt: timestamp("deleted_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_files_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.attachmentId],
			foreignColumns: [attachments.id],
			name: "claim_files_attachment_id_fkey",
		}),
		foreignKey({
			columns: [table.uploadedByUserId],
			foreignColumns: [users.id],
			name: "claim_files_uploaded_by_user_id_fkey",
		}),
		index("idx_claim_files_claim").on(table.claimId, table.deletedAt),
		index("idx_claim_files_attachment").on(table.attachmentId),
		index("idx_claim_files_uploaded").on(table.uploadedAt),
	],
);

export const claimComments = pgTable(
	"claim_comments",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		authorUserId: bigint("author_user_id", { mode: "number" }).notNull(),
		comment: text("comment").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_comments_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.authorUserId],
			foreignColumns: [users.id],
			name: "claim_comments_author_user_id_fkey",
		}),
		index("idx_claim_comments_claim").on(table.claimId),
		index("idx_claim_comments_author").on(table.authorUserId),
		index("idx_claim_comments_created").on(table.createdAt),
	],
);
