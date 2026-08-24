import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	check,
	foreignKey,
	index,
	integer,
	numeric,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

// =============================================
// 1. CORE & REFERENCE TABLES
// =============================================

export const roles = pgTable(
	"roles",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("permissions_name_key").on(table.name),
		index("idx_permissions_name").on(table.name),
	],
);

export const rolePermissions = pgTable(
	"role_permissions",
	{
		roleId: bigint("role_id", { mode: "number" }).notNull(),
		permissionId: bigint("permission_id", { mode: "number" }).notNull(),
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

export const agencies = pgTable(
	"agencies",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		city: varchar("city", { length: 100 }),
		address: varchar("address", { length: 500 }),
		phone: varchar("phone", { length: 20 }),
		email: varchar("email", { length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("agencies_name_key").on(table.name),
		index("idx_agencies_name").on(table.name),
		index("idx_agencies_city").on(table.city),
		index("idx_agencies_active").on(table.isActive),
	],
);

export const centers = pgTable(
	"centers",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		agencyId: bigint("agency_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "centers_agency_id_fkey",
		}),
		index("idx_centers_name").on(table.name),
		index("idx_centers_agency").on(table.agencyId),
		index("idx_centers_active").on(table.isActive),
	],
);

export const customerTypes = pgTable(
	"customer_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("customer_types_name_key").on(table.name),
		index("idx_customer_types_name").on(table.name),
	],
);

export const customers = pgTable(
	"customers",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		companyName: varchar("company_name", { length: 300 }).notNull(),
		customerCode: varchar("customer_code", { length: 50 }),
		address: varchar("address", { length: 500 }),
		city: varchar("city", { length: 100 }),
		phone: varchar("phone", { length: 20 }),
		email: varchar("email", { length: 100 }),
		typeId: bigint("type_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("customers_customer_code_key").on(table.customerCode),
		foreignKey({
			columns: [table.typeId],
			foreignColumns: [customerTypes.id],
			name: "customers_type_id_fkey",
		}),
		index("idx_customers_company").on(table.companyName),
		index("idx_customers_city").on(table.city),
		index("idx_customers_type").on(table.typeId),
		index("idx_customers_active").on(table.isActive),
		index("idx_customers_email").on(table.email),
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
		roleId: bigint("role_id", { mode: "number" }).notNull(),
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

export const stations = pgTable(
	"stations",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		stationCode: varchar("station_code", { length: 50 }).notNull(),
		address: varchar("address", { length: 500 }),
		city: varchar("city", { length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("stations_name_key").on(table.name),
		unique("stations_station_code_key").on(table.stationCode),
		index("idx_stations_name").on(table.name),
		index("idx_stations_city").on(table.city),
		index("idx_stations_active").on(table.isActive),
	],
);

export const goodsTypes = pgTable(
	"goods_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("goods_types_name_key").on(table.name),
		index("idx_goods_types_name").on(table.name),
	],
);

export const goods = pgTable(
	"goods",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		goodsTypeId: bigint("goods_type_id", { mode: "number" }).notNull(),
		goodsCode: varchar("goods_code", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("goods_goods_code_key").on(table.goodsCode),
		foreignKey({
			columns: [table.goodsTypeId],
			foreignColumns: [goodsTypes.id],
			name: "goods_goods_type_id_fkey",
		}),
		index("idx_goods_name").on(table.name),
		index("idx_goods_type").on(table.goodsTypeId),
		index("idx_goods_active").on(table.isActive),
		index("idx_goods_type_active")
			.on(table.goodsTypeId)
			.where(sql`is_active = true`),
	],
);

export const units = pgTable(
	"units",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("units_name_key").on(table.name),
		index("idx_units_name").on(table.name),
	],
);

export const attributes = pgTable(
	"attributes",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		dataType: varchar("data_type", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("attributes_name_key").on(table.name),
		check(
			"attributes_data_type_check",
			sql`(${table.dataType})::text = ANY (ARRAY['string'::text, 'number'::text, 'date'::text, 'boolean'::text, 'decimal'::text])`,
		),
		index("idx_attributes_name").on(table.name),
		index("idx_attributes_type").on(table.dataType),
	],
);

export const parametrization = pgTable(
	"parametrization",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		goodsTypeId: bigint("goods_type_id", { mode: "number" }).notNull(),
		attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
		isRequired: boolean("is_required").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("parametrization_goods_type_id_attribute_id_key").on(
			table.goodsTypeId,
			table.attributeId,
		),
		foreignKey({
			columns: [table.goodsTypeId],
			foreignColumns: [goodsTypes.id],
			name: "parametrization_goods_type_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "parametrization_attribute_id_fkey",
		}).onDelete("cascade"),
		index("idx_parametrization_goods_type").on(table.goodsTypeId),
		index("idx_parametrization_attribute").on(table.attributeId),
	],
);

export const ports = pgTable(
	"ports",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		type: varchar("type", { length: 20 }).notNull(),
		city: varchar("city", { length: 100 }),
		stationId: bigint("station_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("ports_name_key").on(table.name),
		foreignKey({
			columns: [table.stationId],
			foreignColumns: [stations.id],
			name: "ports_station_id_fkey",
		}),
		check(
			"ports_type_check",
			sql`(${table.type})::text = ANY (ARRAY['normal'::text, 'dry'::text])`,
		),
		index("idx_ports_name").on(table.name),
		index("idx_ports_type").on(table.type),
		index("idx_ports_city").on(table.city),
		index("idx_ports_station").on(table.stationId),
		index("idx_ports_active").on(table.isActive),
	],
);

export const berths = pgTable(
	"berths",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		portId: bigint("port_id", { mode: "number" }).notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.portId],
			foreignColumns: [ports.id],
			name: "berths_port_id_fkey",
		}).onDelete("cascade"),
		index("idx_berths_name").on(table.name),
		index("idx_berths_port").on(table.portId),
		index("idx_berths_active").on(table.isActive),
		index("idx_berths_port_active")
			.on(table.portId)
			.where(sql`is_active = true`),
	],
);

export const loadingLocations = pgTable(
	"loading_locations",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		portId: bigint("port_id", { mode: "number" }).notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.portId],
			foreignColumns: [ports.id],
			name: "loading_locations_port_id_fkey",
		}).onDelete("cascade"),
		index("idx_loading_locations_name").on(table.name),
		index("idx_loading_locations_port").on(table.portId),
		index("idx_loading_locations_active").on(table.isActive),
	],
);

export const sidings = pgTable(
	"sidings",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		city: varchar("city", { length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("sidings_name_key").on(table.name),
		index("idx_sidings_name").on(table.name),
		index("idx_sidings_city").on(table.city),
		index("idx_sidings_active").on(table.isActive),
	],
);

export const accessoryOperations = pgTable(
	"accessory_operations",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("accessory_operations_name_key").on(table.name),
		index("idx_accessory_operations_name").on(table.name),
	],
);

export const rejectionReasons = pgTable(
	"rejection_reasons",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 300 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("rejection_reasons_name_key").on(table.name),
		index("idx_rejection_reasons_name").on(table.name),
	],
);

export const movementTypes = pgTable(
	"movement_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		description: varchar("description", { length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("movement_types_name_key").on(table.name),
		index("idx_movement_types_name").on(table.name),
	],
);

export const pickupLocationTypes = pgTable(
	"pickup_location_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		description: varchar("description", { length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("pickup_location_types_name_key").on(table.name),
		index("idx_pickup_location_types_name").on(table.name),
	],
);

export const dispatchTypes = pgTable(
	"dispatch_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		description: varchar("description", { length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("dispatch_types_name_key").on(table.name),
		index("idx_dispatch_types_name").on(table.name),
	],
);

export const customerParametrization = pgTable(
	"customer_parametrization",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		customerCode: varchar("customer_code", { length: 50 }).notNull(),
		type: varchar("type", { length: 50 }).notNull(),
		portName: varchar("port_name", { length: 50 }),
		terminalName: varchar("terminal_name", { length: 100 }),
		supervisor: varchar("supervisor", { length: 255 }),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique(
			"customer_parametrization_customer_code_type_port_name_termi_key",
		).on(table.customerCode, table.type, table.portName, table.terminalName),
		index("idx_customer_parametrization_code").on(table.customerCode),
		index("idx_customer_parametrization_type").on(table.type),
		index("idx_customer_parametrization_active").on(table.isActive),
	],
);

export const vessels = pgTable(
	"vessels",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("vessels_name_key").on(table.name),
		index("idx_vessels_name").on(table.name),
		index("idx_vessels_active").on(table.isActive),
	],
);

export const importers = pgTable(
	"importers",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("importers_name_key").on(table.name),
		index("idx_importers_name").on(table.name),
		index("idx_importers_active").on(table.isActive),
	],
);

export const representatives = pgTable(
	"representatives",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("representatives_name_key").on(table.name),
		index("idx_representatives_name").on(table.name),
		index("idx_representatives_active").on(table.isActive),
	],
);

export const shippingCompanies = pgTable(
	"shipping_companies",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("shipping_companies_name_key").on(table.name),
		index("idx_shipping_companies_name").on(table.name),
		index("idx_shipping_companies_active").on(table.isActive),
	],
);

// =============================================
// 2. ORDER MANAGEMENT TABLES
// =============================================

export const orderStatus = pgTable(
	"order_status",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("order_status_name_key").on(table.name),
		index("idx_order_status_name").on(table.name),
	],
);

export const programStatus = pgTable(
	"program_status",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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

export const orders = pgTable(
	"orders",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		goodsId: bigint("goods_id", { mode: "number" }).notNull(),
		customerId: bigint("customer_id", { mode: "number" }).notNull(),
		createdByUserId: bigint("created_by_user_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		supervisor: varchar("supervisor", { length: 200 }),
		orderNumber: varchar("order_number", { length: 50 }),
		movementTypeId: bigint("movement_type_id", { mode: "number" }),
		parentOrderId: bigint("parent_order_id", { mode: "number" }),
		quantityDemanded: numeric("quantity_demanded", {
			precision: 18,
			scale: 3,
		}).notNull(),
		quantityAchieved: numeric("quantity_achieved", {
			precision: 18,
			scale: 3,
		}).default("0"),
		unitId: bigint("unit_id", { mode: "number" }).notNull(),
		departureStationId: bigint("departure_station_id", { mode: "number" }),
		debtorCustomerId: bigint("debtor_customer_id", { mode: "number" }),
		pickupLocationTypeId: bigint("pickup_location_type_id", { mode: "number" }),
		dispatchTypeId: bigint("dispatch_type_id", { mode: "number" }),
		destinationCustomerId: bigint("destination_customer_id", {
			mode: "number",
		}),
		arrivalStationId: bigint("arrival_station_id", { mode: "number" }),
		deliveryLocationTypeId: bigint("delivery_location_type_id", {
			mode: "number",
		}),
		pickupPortId: bigint("pickup_port_id", { mode: "number" }),
		pickupBerthId: bigint("pickup_berth_id", { mode: "number" }),
		pickupSidingId: bigint("pickup_siding_id", { mode: "number" }),
		deliveryPortId: bigint("delivery_port_id", { mode: "number" }),
		deliveryBerthId: bigint("delivery_berth_id", { mode: "number" }),
		deliverySidingId: bigint("delivery_siding_id", { mode: "number" }),
		remarks: text("remarks"),
		orderDate: timestamp("order_date", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		startDate: timestamp("start_date", { mode: "string" }),
		endDate: timestamp("end_date", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("orders_order_number_key").on(table.orderNumber),
		foreignKey({
			columns: [table.goodsId],
			foreignColumns: [goods.id],
			name: "orders_goods_id_fkey",
		}),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "orders_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "orders_created_by_user_id_fkey",
		}),
		foreignKey({
			columns: [table.statusId],
			foreignColumns: [orderStatus.id],
			name: "orders_status_id_fkey",
		}),
		foreignKey({
			columns: [table.movementTypeId],
			foreignColumns: [movementTypes.id],
			name: "orders_movement_type_id_fkey",
		}),
		foreignKey({
			columns: [table.parentOrderId],
			foreignColumns: [table.id],
			name: "orders_parent_order_id_fkey",
		}),
		foreignKey({
			columns: [table.unitId],
			foreignColumns: [units.id],
			name: "orders_unit_id_fkey",
		}),
		foreignKey({
			columns: [table.departureStationId],
			foreignColumns: [stations.id],
			name: "orders_departure_station_id_fkey",
		}),
		foreignKey({
			columns: [table.debtorCustomerId],
			foreignColumns: [customers.id],
			name: "orders_debtor_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.pickupLocationTypeId],
			foreignColumns: [pickupLocationTypes.id],
			name: "orders_pickup_location_type_id_fkey",
		}),
		foreignKey({
			columns: [table.dispatchTypeId],
			foreignColumns: [dispatchTypes.id],
			name: "orders_dispatch_type_id_fkey",
		}),
		foreignKey({
			columns: [table.destinationCustomerId],
			foreignColumns: [customers.id],
			name: "orders_destination_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.arrivalStationId],
			foreignColumns: [stations.id],
			name: "orders_arrival_station_id_fkey",
		}),
		foreignKey({
			columns: [table.deliveryLocationTypeId],
			foreignColumns: [pickupLocationTypes.id],
			name: "orders_delivery_location_type_id_fkey",
		}),
		foreignKey({
			columns: [table.pickupPortId],
			foreignColumns: [ports.id],
			name: "orders_pickup_port_id_fkey",
		}),
		foreignKey({
			columns: [table.pickupBerthId],
			foreignColumns: [berths.id],
			name: "orders_pickup_berth_id_fkey",
		}),
		foreignKey({
			columns: [table.pickupSidingId],
			foreignColumns: [sidings.id],
			name: "orders_pickup_siding_id_fkey",
		}),
		foreignKey({
			columns: [table.deliveryPortId],
			foreignColumns: [ports.id],
			name: "orders_delivery_port_id_fkey",
		}),
		foreignKey({
			columns: [table.deliveryBerthId],
			foreignColumns: [berths.id],
			name: "orders_delivery_berth_id_fkey",
		}),
		foreignKey({
			columns: [table.deliverySidingId],
			foreignColumns: [sidings.id],
			name: "orders_delivery_siding_id_fkey",
		}),
		index("idx_orders_number")
			.on(table.orderNumber)
			.where(sql`order_number IS NOT NULL`),
		index("idx_orders_goods").on(table.goodsId),
		index("idx_orders_customer").on(table.customerId),
		index("idx_orders_created_by_user").on(table.createdByUserId),
		index("idx_orders_status").on(table.statusId),
		index("idx_orders_movement_type").on(table.movementTypeId),
		index("idx_orders_parent").on(table.parentOrderId),
		index("idx_orders_date").on(table.orderDate),
		index("idx_orders_start").on(table.startDate),
		index("idx_orders_end").on(table.endDate),
		index("idx_orders_departure_station").on(table.departureStationId),
		index("idx_orders_arrival_station").on(table.arrivalStationId),
		index("idx_orders_debtor_customer").on(table.debtorCustomerId),
		index("idx_orders_destination_customer").on(table.destinationCustomerId),
		index("idx_orders_pickup_location_type").on(table.pickupLocationTypeId),
		index("idx_orders_delivery_location_type").on(table.deliveryLocationTypeId),
		index("idx_orders_dispatch_type").on(table.dispatchTypeId),
		index("idx_orders_created").on(table.createdAt),
		index("idx_orders_customer_status").on(table.customerId, table.statusId),
		index("idx_orders_date_range_status").on(
			table.startDate,
			table.endDate,
			table.statusId,
		),
		index("idx_orders_quantities").on(
			table.quantityDemanded,
			table.quantityAchieved,
			table.statusId,
		),
		index("idx_orders_dtm_sync").on(table.statusId),
		index("idx_orders_tc_export")
			.on(table.goodsId, table.movementTypeId, table.statusId)
			.where(sql`parent_order_id IS NULL`),
	],
);

export const orderAttributes = pgTable(
	"order_attributes",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
		value: text("value"),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("order_attributes_order_id_attribute_id_key").on(
			table.orderId,
			table.attributeId,
		),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_attributes_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "order_attributes_attribute_id_fkey",
		}),
		index("idx_order_attributes_order").on(table.orderId),
		index("idx_order_attributes_attribute").on(table.attributeId),
	],
);

export const orderStatusHistory = pgTable(
	"order_status_history",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		changedById: bigint("changed_by_id", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		comment: text("comment"),
		rejectionReasonId: bigint("rejection_reason_id", { mode: "number" }),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_status_history_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.statusId],
			foreignColumns: [orderStatus.id],
			name: "order_status_history_status_id_fkey",
		}),
		foreignKey({
			columns: [table.changedById],
			foreignColumns: [users.id],
			name: "order_status_history_changed_by_id_fkey",
		}),
		foreignKey({
			columns: [table.rejectionReasonId],
			foreignColumns: [rejectionReasons.id],
			name: "order_status_history_rejection_reason_id_fkey",
		}),
		index("idx_order_status_history_order").on(table.orderId),
		index("idx_order_status_history_status").on(table.statusId),
		index("idx_order_status_history_user").on(table.changedById),
		index("idx_order_status_history_date").on(table.changedAt),
	],
);

export const orderAccessoryOperations = pgTable(
	"order_accessory_operations",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		operationId: bigint("operation_id", { mode: "number" }).notNull(),
		status: varchar("status", { length: 50 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_accessory_operations_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.operationId],
			foreignColumns: [accessoryOperations.id],
			name: "order_accessory_operations_operation_id_fkey",
		}),
		index("idx_order_operations_order").on(table.orderId),
		index("idx_order_operations_operation").on(table.operationId),
		index("idx_order_operations_status").on(table.status),
	],
);

export const forecastPrograms = pgTable(
	"forecast_programs",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		programNumber: varchar("program_number", { length: 30 }).notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
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
		oldStatusId: bigint("old_status_id", { mode: "number" }),
		newStatusId: bigint("new_status_id", { mode: "number" }),
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

export const orderExecutions = pgTable(
	"order_executions",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		executionDate: timestamp("execution_date", { mode: "string" }).notNull(),
		quantityExecuted: numeric("quantity_executed", {
			precision: 18,
			scale: 3,
		}).notNull(),
		completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
		comment: text("comment"),
		executedByUserId: bigint("executed_by_user_id", {
			mode: "number",
		}).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_executions_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.executedByUserId],
			foreignColumns: [users.id],
			name: "order_executions_executed_by_user_id_fkey",
		}),
		index("idx_order_executions_order").on(table.orderId),
		index("idx_order_executions_date").on(table.executionDate),
		index("idx_order_executions_user").on(table.executedByUserId),
		index("idx_order_executions_created").on(table.createdAt),
		index("idx_executions_order_date").on(table.orderId, table.executionDate),
		index("idx_executions_date_user").on(
			table.executionDate,
			table.executedByUserId,
		),
	],
);

export const orderFiles = pgTable(
	"order_files",
	{
		fileId: bigserial("file_id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		fileName: varchar("file_name", { length: 255 }).notNull(),
		fileType: varchar("file_type", { length: 50 }).notNull(),
		fileSize: bigint("file_size", { mode: "number" }).notNull(),
		filePath: varchar("file_path", { length: 500 }).notNull(),
		mimeType: varchar("mime_type", { length: 100 }),
		uploadedByUserId: bigint("uploaded_by_user_id", {
			mode: "number",
		}).notNull(),
		uploadedAt: timestamp("uploaded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		description: varchar("description", { length: 500 }),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_files_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.uploadedByUserId],
			foreignColumns: [users.id],
			name: "order_files_uploaded_by_user_id_fkey",
		}),
		index("idx_order_files_order").on(table.orderId),
		index("idx_order_files_type").on(table.fileType),
		index("idx_order_files_uploaded").on(table.uploadedAt),
	],
);

export const orderShares = pgTable(
	"order_shares",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		agencyId: bigint("agency_id", { mode: "number" }).notNull(),
		sharedByUserId: bigint("shared_by_user_id", { mode: "number" }).notNull(),
		sharedAt: timestamp("shared_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		note: varchar("note", { length: 500 }),
	},
	(table) => [
		unique("order_shares_order_id_agency_id_key").on(
			table.orderId,
			table.agencyId,
		),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_shares_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "order_shares_agency_id_fkey",
		}),
		foreignKey({
			columns: [table.sharedByUserId],
			foreignColumns: [users.id],
			name: "order_shares_shared_by_user_id_fkey",
		}),
		index("idx_order_shares_order").on(table.orderId),
		index("idx_order_shares_agency").on(table.agencyId),
		index("idx_order_shares_user").on(table.sharedByUserId),
	],
);

export const orderDateModifications = pgTable(
	"order_date_modifications",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		modifiedByUserId: bigint("modified_by_user_id", {
			mode: "number",
		}).notNull(),
		modifiedAt: timestamp("modified_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		oldStartDate: timestamp("old_start_date", { mode: "string" }),
		newStartDate: timestamp("new_start_date", { mode: "string" }),
		comment: varchar("comment", { length: 500 }),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_date_modifications_order_id_fkey",
		}),
		foreignKey({
			columns: [table.modifiedByUserId],
			foreignColumns: [users.id],
			name: "order_date_modifications_modified_by_user_id_fkey",
		}),
		index("idx_order_date_modifications_order").on(table.orderId),
	],
);

// =============================================
// 3. CLAIMS MANAGEMENT
// =============================================

export const claimTypes = pgTable(
	"claim_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		operationId: bigint("operation_id", { mode: "number" }),
		typeId: bigint("type_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
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
		statusId: bigint("status_id", { mode: "number" }).notNull(),
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
		filePath: varchar("file_path", { length: 500 }).notNull(),
		fileName: varchar("file_name", { length: 255 }).notNull(),
		fileType: varchar("file_type", { length: 100 }),
		uploadedByUserId: bigint("uploaded_by_user_id", {
			mode: "number",
		}).notNull(),
		uploadedAt: timestamp("uploaded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_files_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.uploadedByUserId],
			foreignColumns: [users.id],
			name: "claim_files_uploaded_by_user_id_fkey",
		}),
		index("idx_claim_files_claim").on(table.claimId),
		index("idx_claim_files_user").on(table.uploadedByUserId),
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

// =============================================
// 4. TRACKING & LOGISTICS TABLES
// =============================================

export const wagons = pgTable(
	"wagons",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		externalId: varchar("external_id", { length: 100 }),
		wagonNumber: varchar("wagon_number", { length: 50 }).notNull(),
		type: varchar("type", { length: 100 }),
		capacity: numeric("capacity", { precision: 18, scale: 3 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("wagons_external_id_key").on(table.externalId),
		unique("wagons_wagon_number_key").on(table.wagonNumber),
		index("idx_wagons_external").on(table.externalId),
		index("idx_wagons_number").on(table.wagonNumber),
		index("idx_wagons_type").on(table.type),
		index("idx_wagons_active").on(table.isActive),
	],
);

export const trains = pgTable(
	"trains",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		externalId: varchar("external_id", { length: 100 }),
		trainNumber: varchar("train_number", { length: 50 }).notNull(),
		status: varchar("status", { length: 50 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		unique("trains_external_id_key").on(table.externalId),
		unique("trains_train_number_key").on(table.trainNumber),
		index("idx_trains_external").on(table.externalId),
		index("idx_trains_number").on(table.trainNumber),
		index("idx_trains_status").on(table.status),
		index("idx_trains_active").on(table.isActive),
	],
);

export const trainWagons = pgTable(
	"train_wagons",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		attachedAt: timestamp("attached_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		detachedAt: timestamp("detached_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_wagons_train_id_fkey",
		}),
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "train_wagons_wagon_id_fkey",
		}),
		index("idx_train_wagons_train").on(table.trainId),
		index("idx_train_wagons_wagon").on(table.wagonId),
		index("idx_train_wagons_attached").on(table.attachedAt),
		index("idx_train_wagons_detached").on(table.detachedAt),
	],
);

export const orderWagons = pgTable(
	"order_wagons",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		quantityLoaded: numeric("quantity_loaded", { precision: 18, scale: 3 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		forecastProgramId: bigint("forecast_program_id", { mode: "number" }),
		trainId: bigint("train_id", { mode: "number" }),
	},
	(table) => [
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_wagons_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "order_wagons_wagon_id_fkey",
		}),
		foreignKey({
			columns: [table.forecastProgramId],
			foreignColumns: [forecastPrograms.id],
			name: "order_wagons_forecast_program_id_fkey",
		}),
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "order_wagons_train_id_fkey",
		}),
		index("idx_order_wagons_order").on(table.orderId),
		index("idx_order_wagons_wagon").on(table.wagonId),
		index("idx_order_wagons_program").on(table.forecastProgramId),
		index("idx_order_wagons_train").on(table.trainId),
	],
);

export const wagonTracking = pgTable(
	"wagon_tracking",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		latitude: numeric("latitude", { precision: 10, scale: 8 }),
		longitude: numeric("longitude", { precision: 11, scale: 8 }),
		status: varchar("status", { length: 50 }),
		recordedAt: timestamp("recorded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_tracking_wagon_id_fkey",
		}),
		index("idx_wagon_tracking_wagon").on(table.wagonId),
		index("idx_wagon_tracking_recorded").on(table.recordedAt),
		index("idx_wagon_tracking_status").on(table.status),
		index("idx_wagon_tracking_location").on(table.latitude, table.longitude),
		index("idx_wagon_tracking_wagon_date").on(table.wagonId, table.recordedAt),
		index("idx_wagon_tracking_cleanup").on(table.recordedAt),
	],
);

export const trainTracking = pgTable(
	"train_tracking",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		latitude: numeric("latitude", { precision: 10, scale: 8 }),
		longitude: numeric("longitude", { precision: 11, scale: 8 }),
		status: varchar("status", { length: 50 }),
		recordedAt: timestamp("recorded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_tracking_train_id_fkey",
		}),
		index("idx_train_tracking_train").on(table.trainId),
		index("idx_train_tracking_recorded").on(table.recordedAt),
		index("idx_train_tracking_status").on(table.status),
		index("idx_train_tracking_location").on(table.latitude, table.longitude),
		index("idx_train_tracking_train_date").on(table.trainId, table.recordedAt),
		index("idx_train_tracking_cleanup").on(table.recordedAt),
	],
);

export const wagonCurrentStatus = pgTable(
	"wagon_current_status",
	{
		wagonId: bigint("wagon_id", { mode: "number" }).primaryKey().notNull(),
		lastLatitude: numeric("last_latitude", { precision: 10, scale: 8 }),
		lastLongitude: numeric("last_longitude", { precision: 11, scale: 8 }),
		lastStatus: varchar("last_status", { length: 50 }),
		lastUpdate: timestamp("last_update", { mode: "string" }).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_current_status_wagon_id_fkey",
		}).onDelete("cascade"),
		index("idx_wagon_current_status_update").on(table.lastUpdate),
		index("idx_wagon_current_status_status").on(table.lastStatus),
		index("idx_wagon_current_status_location").on(
			table.lastLatitude,
			table.lastLongitude,
		),
	],
);

export const trainCurrentStatus = pgTable(
	"train_current_status",
	{
		trainId: bigint("train_id", { mode: "number" }).primaryKey().notNull(),
		lastLatitude: numeric("last_latitude", { precision: 10, scale: 8 }),
		lastLongitude: numeric("last_longitude", { precision: 11, scale: 8 }),
		lastStatus: varchar("last_status", { length: 50 }),
		lastUpdate: timestamp("last_update", { mode: "string" }).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_current_status_train_id_fkey",
		}).onDelete("cascade"),
		index("idx_train_current_status_update").on(table.lastUpdate),
		index("idx_train_current_status_status").on(table.lastStatus),
		index("idx_train_current_status_location").on(
			table.lastLatitude,
			table.lastLongitude,
		),
	],
);

export const stationPassages = pgTable(
	"station_passages",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		stationId: bigint("station_id", { mode: "number" }).notNull(),
		arrivalTime: timestamp("arrival_time", { mode: "string" }),
		departureTime: timestamp("departure_time", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "station_passages_wagon_id_fkey",
		}),
		foreignKey({
			columns: [table.stationId],
			foreignColumns: [stations.id],
			name: "station_passages_station_id_fkey",
		}),
		index("idx_station_passages_wagon").on(table.wagonId),
		index("idx_station_passages_station").on(table.stationId),
		index("idx_station_passages_arrival").on(table.arrivalTime),
		index("idx_station_passages_departure").on(table.departureTime),
		index("idx_station_passages_wagon_time").on(
			table.wagonId,
			table.arrivalTime,
		),
	],
);

export const programConvoi = pgTable(
	"program_convoi",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		forecastProgramId: bigint("forecast_program_id", {
			mode: "number",
		}).notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		convoy: varchar("convoy", { length: 100 }).notNull(),
		status: varchar("status", { length: 50 }),
		since: timestamp("since", { mode: "string" }),
		quantity: numeric("quantity", { precision: 18, scale: 3 }),
		unit: varchar("unit", { length: 20 }),
		wagonCount: integer("wagon_count"),
		eta: timestamp("eta", { mode: "string" }),
		delayMinutes: integer("delay_minutes"),
		lastLatitude: numeric("last_latitude", { precision: 10, scale: 8 }),
		lastLongitude: numeric("last_longitude", { precision: 11, scale: 8 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		unique("program_convoi_forecast_program_id_train_id_key").on(
			table.forecastProgramId,
			table.trainId,
		),
		foreignKey({
			columns: [table.forecastProgramId],
			foreignColumns: [forecastPrograms.id],
			name: "program_convoi_forecast_program_id_fkey",
		}),
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "program_convoi_train_id_fkey",
		}),
		index("idx_program_convoi_program").on(table.forecastProgramId),
		index("idx_program_convoi_train").on(table.trainId),
	],
);

// =============================================
// 5. NOTIFICATION & INTEGRATION TABLES
// =============================================

export const notificationTypes = pgTable(
	"notification_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		typeId: bigint("type_id", { mode: "number" }).notNull(),
		channelId: bigint("channel_id", { mode: "number" }).notNull(),
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

export const dtmRequestTypes = pgTable(
	"dtm_request_types",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
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
		requestTypeId: bigint("request_type_id", { mode: "number" }).notNull(),
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

// =============================================
// 6. ARCHIVE MANAGEMENT TABLES
// =============================================

export const wagonTrackingArchive = pgTable(
	"wagon_tracking_archive",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		latitude: numeric("latitude", { precision: 10, scale: 8 }),
		longitude: numeric("longitude", { precision: 11, scale: 8 }),
		speed: numeric("speed", { precision: 10, scale: 2 }),
		direction: numeric("direction", { precision: 5, scale: 2 }),
		trackedAt: timestamp("tracked_at", { mode: "string" }).notNull(),
		archivedAt: timestamp("archived_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_tracking_archive_wagon_id_fkey",
		}),
		index("idx_wagon_tracking_archive_wagon").on(table.wagonId),
		index("idx_wagon_tracking_archive_tracked").on(table.trackedAt),
		index("idx_wagon_tracking_archive_archived").on(table.archivedAt),
	],
);

export const trainTrackingArchive = pgTable(
	"train_tracking_archive",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		latitude: numeric("latitude", { precision: 10, scale: 8 }),
		longitude: numeric("longitude", { precision: 11, scale: 8 }),
		speed: numeric("speed", { precision: 10, scale: 2 }),
		direction: numeric("direction", { precision: 5, scale: 2 }),
		trackedAt: timestamp("tracked_at", { mode: "string" }).notNull(),
		archivedAt: timestamp("archived_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_tracking_archive_train_id_fkey",
		}),
		index("idx_train_tracking_archive_train").on(table.trainId),
		index("idx_train_tracking_archive_tracked").on(table.trackedAt),
		index("idx_train_tracking_archive_archived").on(table.archivedAt),
	],
);

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
