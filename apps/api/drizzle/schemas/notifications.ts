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

export const notificationTypes = pgTable(
	"notification_types",
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
		unique("notification_types_name_key").on(table.name),
		index("idx_notification_types_name").on(table.name),
		index("idx_notification_types_active").on(table.isActive),
	],
);

export const notificationChannels = pgTable(
	"notification_channels",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("notification_channels_name_key").on(table.name),
		index("idx_notification_channels_name").on(table.name),
		index("idx_notification_channels_active").on(table.isActive),
	],
);

export const notifications = pgTable(
	"notifications",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		recipientUserId: bigint("recipient_user_id", { mode: "number" }).notNull(),
		typeId: uuid("type_id").notNull(),
		channelId: uuid("channel_id").notNull(),
		title: varchar("title", { length: 200 }).notNull(),
		message: text("message").notNull(),
		relatedEntityType: varchar("related_entity_type", { length: 50 }),
		relatedEntityId: bigint("related_entity_id", { mode: "number" }),
		status: varchar("status", { length: 20 }).notNull(),
		sentAt: timestamp("sent_at", { mode: "string" }),
		readAt: timestamp("read_at", { mode: "string" }),
		errorMessage: text("error_message"),
		retryCount: integer("retry_count").default(0),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.recipientUserId],
			foreignColumns: [users.id],
			name: "notifications_recipient_user_id_fkey",
		}),
		foreignKey({
			columns: [table.typeId],
			foreignColumns: [notificationTypes.id],
			name: "notifications_type_id_fkey",
		}),
		foreignKey({
			columns: [table.channelId],
			foreignColumns: [notificationChannels.id],
			name: "notifications_channel_id_fkey",
		}),
		check(
			"notifications_status_check",
			sql`(${table.status})::text = ANY (ARRAY['PENDING'::text, 'SENT'::text, 'FAILED'::text, 'READ'::text])`,
		),
		index("idx_notifications_recipient").on(table.recipientUserId),
		index("idx_notifications_type").on(table.typeId),
		index("idx_notifications_channel").on(table.channelId),
		index("idx_notifications_status").on(table.status),
		index("idx_notifications_entity").on(
			table.relatedEntityType,
			table.relatedEntityId,
		),
		index("idx_notifications_sent").on(table.sentAt),
		index("idx_notifications_read").on(table.readAt),
		index("idx_notifications_created").on(table.createdAt),
		index("idx_notifications_user_read").on(
			table.recipientUserId,
			table.readAt,
			table.createdAt,
		),
		index("idx_notifications_retry")
			.on(table.status, table.retryCount)
			.where(sql`(status)::text = 'FAILED'::text AND retry_count < 3`),
		index("idx_notifications_entity_user").on(
			table.relatedEntityType,
			table.relatedEntityId,
			table.recipientUserId,
		),
	],
);
