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
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { agencies, customers } from "./customers";

export const roles = pgTable(
	"roles",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("roles_name_key").on(table.name),
		index("idx_roles_name").on(table.name),
		index("idx_roles_active").on(table.isActive),
	],
);

export const permissions = pgTable(
	"permissions",
	{
		id: uuid("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 500 }),
		parentId: uuid("parent_id"),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "permissions_parent_id_fkey",
		}).onDelete("set null"),
		unique("permissions_name_key").on(table.name),
		index("idx_permissions_name").on(table.name),
		index("idx_permissions_parent_id").on(table.parentId),
	],
);

export const rolePermissions = pgTable(
	"role_permissions",
	{
		roleId: uuid("role_id").notNull(),
		permissionId: uuid("permission_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_fkey",
		}).onDelete("cascade"),
		primaryKey({
			columns: [table.roleId, table.permissionId],
			name: "role_permissions_pkey",
		}),
	],
);

export const users = pgTable(
	"users",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		email: varchar("email", { length: 100 }).notNull(),
		password: varchar("password", { length: 255 }).notNull(),
		lastName: varchar("last_name", { length: 100 }).notNull(),
		firstName: varchar("first_name", { length: 100 }).notNull(),
		employeeId: varchar("employee_id", { length: 50 }),
		type: varchar("type", { length: 20 }),
		roleId: uuid("role_id").notNull(),
		customerId: bigint("customer_id", { mode: "number" }),
		agencyId: bigint("agency_id", { mode: "number" }),
		failedLoginAttempts: integer("failed_login_attempts").default(0),
		accountLockedUntil: timestamp("account_locked_until", { mode: "string" }),
		createdBy: varchar("created_by", { length: 100 }),
		updatedBy: varchar("updated_by", { length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		lastLogin: timestamp("last_login", { mode: "string" }),
	},
	(table) => [
		unique("users_email_key").on(table.email),
		foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_fkey",
		}),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "users_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "users_agency_id_fkey",
		}),
		check(
			"users_type_check",
			sql`(${table.type})::text = ANY (ARRAY['internal'::text, 'external'::text])`,
		),
		index("idx_users_email").on(table.email),
		index("idx_users_employee").on(table.employeeId),
		index("idx_users_type").on(table.type),
		index("idx_users_role").on(table.roleId),
		index("idx_users_customer").on(table.customerId),
		index("idx_users_agency").on(table.agencyId),
		index("idx_users_active").on(table.isActive),
		index("idx_users_locked").on(table.accountLockedUntil),
	],
);

export const userCustomers = pgTable(
	"user_customers",
	{
		userId: bigint("user_id", { mode: "number" }).notNull(),
		customerId: bigint("customer_id", { mode: "number" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_customers_user_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "user_customers_customer_id_fkey",
		}).onDelete("cascade"),
		primaryKey({
			columns: [table.userId, table.customerId],
			name: "user_customers_pkey",
		}),
	],
);

export const userSessions = pgTable(
	"user_sessions",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		sessionToken: varchar("session_token", { length: 1700 }).notNull(),
		ipAddress: varchar("ip_address", { length: 50 }),
		deviceInfo: varchar("device_info", { length: 500 }),
		loginAt: timestamp("login_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		logoutAt: timestamp("logout_at", { mode: "string" }),
		expiredAt: timestamp("expired_at", { mode: "string" }).notNull(),
	},
	(table) => [
		unique("user_sessions_session_token_key").on(table.sessionToken),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_fkey",
		}).onDelete("cascade"),
		index("idx_user_sessions_user").on(table.userId),
		index("idx_user_sessions_token").on(table.sessionToken),
		index("idx_user_sessions_expired").on(table.expiredAt),
		index("idx_user_sessions_expired_cleanup")
			.on(table.expiredAt, table.logoutAt)
			.where(sql`logout_at IS NULL`),
		index("idx_user_sessions_user_active")
			.on(table.userId, table.expiredAt)
			.where(sql`logout_at IS NULL`),
	],
);

export const userActivityLog = pgTable(
	"user_activity_log",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		actorUserId: bigint("actor_user_id", { mode: "number" }).notNull(),
		customerId: bigint("customer_id", { mode: "number" }),
		agencyId: bigint("agency_id", { mode: "number" }),
		actionType: varchar("action_type", { length: 100 }).notNull(),
		actionDetails: text("action_details"),
		ipAddress: varchar("ip_address", { length: 50 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.actorUserId],
			foreignColumns: [users.id],
			name: "user_activity_log_actor_user_id_fkey",
		}),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "user_activity_log_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "user_activity_log_agency_id_fkey",
		}),
		index("idx_user_activity_actor").on(table.actorUserId),
		index("idx_user_activity_customer").on(table.customerId),
		index("idx_user_activity_agency").on(table.agencyId),
		index("idx_user_activity_action").on(table.actionType),
		index("idx_user_activity_date").on(table.createdAt),
	],
);

export const passwordResetTokens = pgTable(
	"password_reset_tokens",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		token: varchar("token", { length: 100 }).notNull(),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		used: boolean("used").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("password_reset_tokens_token_key").on(table.token),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey",
		}).onDelete("cascade"),
		index("idx_password_reset_tokens_token").on(table.token),
		index("idx_password_reset_tokens_user").on(table.userId),
	],
);
