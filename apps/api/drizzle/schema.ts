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

export const customerTypes = pgTable(
	"customer_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_customer_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("customer_types_name_key").on(table.name),
	],
);

export const roles = pgTable(
	"roles",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_roles_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_roles_name").using("btree", table.name.asc().nullsLast()),
		unique("roles_name_key").on(table.name),
	],
);

export const permissions = pgTable(
	"permissions",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_permissions_name").using("btree", table.name.asc().nullsLast()),
		unique("permissions_name_key").on(table.name),
	],
);

export const customers = pgTable(
	"customers",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		companyName: varchar("company_name", { length: 300 }).notNull(),
		address: varchar({ length: 500 }),
		city: varchar({ length: 100 }),
		phone: varchar({ length: 20 }),
		email: varchar({ length: 100 }),
		typeId: bigint("type_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		customerCode: varchar("customer_code", { length: 50 }),
	},
	(table) => [
		index("idx_customers_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_customers_city").using("btree", table.city.asc().nullsLast()),
		index("idx_customers_company").using(
			"btree",
			table.companyName.asc().nullsLast(),
		),
		index("idx_customers_email").using("btree", table.email.asc().nullsLast()),
		index("idx_customers_type").using("btree", table.typeId.asc().nullsLast()),
		unique("customers_customer_code_key").on(table.customerCode),
		foreignKey({
			columns: [table.typeId],
			foreignColumns: [customerTypes.id],
			name: "customers_type_id_fkey",
		}),
	],
);

export const agencies = pgTable(
	"agencies",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		city: varchar({ length: 100 }),
		address: varchar({ length: 500 }),
		phone: varchar({ length: 20 }),
		email: varchar({ length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_agencies_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_agencies_city").using("btree", table.city.asc().nullsLast()),
		index("idx_agencies_name").using("btree", table.name.asc().nullsLast()),
		unique("agencies_name_key").on(table.name),
	],
);

export const centers = pgTable(
	"centers",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
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
		index("idx_centers_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_centers_agency").using(
			"btree",
			table.agencyId.asc().nullsLast(),
		),
		index("idx_centers_name").using("btree", table.name.asc().nullsLast()),
		foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "centers_agency_id_fkey",
		}),
	],
);

export const users = pgTable(
	"users",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		email: varchar({ length: 100 }).notNull(),
		password: varchar({ length: 255 }).notNull(),
		lastName: varchar("last_name", { length: 100 }).notNull(),
		firstName: varchar("first_name", { length: 100 }).notNull(),
		employeeId: varchar("employee_id", { length: 50 }),
		type: varchar({ length: 20 }),
		roleId: bigint("role_id", { mode: "number" }).notNull(),
		customerId: bigint("customer_id", { mode: "number" }),
		agencyId: bigint("agency_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		lastLogin: timestamp("last_login", { mode: "string" }),
		failedLoginAttempts: integer("failed_login_attempts").default(0),
		accountLockedUntil: timestamp("account_locked_until", { mode: "string" }),
		createdBy: varchar("created_by", { length: 100 }),
		updatedBy: varchar("updated_by", { length: 100 }),
	},
	(table) => [
		index("idx_users_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_users_agency").using("btree", table.agencyId.asc().nullsLast()),
		index("idx_users_customer").using(
			"btree",
			table.customerId.asc().nullsLast(),
		),
		index("idx_users_email").using("btree", table.email.asc().nullsLast()),
		index("idx_users_employee").using(
			"btree",
			table.employeeId.asc().nullsLast(),
		),
		index("idx_users_locked").using(
			"btree",
			table.accountLockedUntil.asc().nullsLast(),
		),
		index("idx_users_role").using("btree", table.roleId.asc().nullsLast()),
		index("idx_users_type").using("btree", table.type.asc().nullsLast()),
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
		unique("users_email_key").on(table.email),
		check(
			"users_type_check",
			sql`(type)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[])`,
		),
	],
);

export const userSessions = pgTable(
	"user_sessions",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
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
		index("idx_user_sessions_expired").using(
			"btree",
			table.expiredAt.asc().nullsLast(),
		),
		index("idx_user_sessions_expired_cleanup")
			.using(
				"btree",
				table.expiredAt.asc().nullsLast(),
				table.logoutAt.asc().nullsLast(),
			)
			.where(sql`(logout_at IS NULL)`),
		index("idx_user_sessions_token").using(
			"btree",
			table.sessionToken.asc().nullsLast(),
		),
		index("idx_user_sessions_user").using(
			"btree",
			table.userId.asc().nullsLast(),
		),
		index("idx_user_sessions_user_active")
			.using(
				"btree",
				table.userId.asc().nullsLast(),
				table.expiredAt.asc().nullsLast(),
			)
			.where(sql`(logout_at IS NULL)`),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_fkey",
		}).onDelete("cascade"),
		unique("user_sessions_session_token_key").on(table.sessionToken),
	],
);

export const userActivityLog = pgTable(
	"user_activity_log",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
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
		index("idx_user_activity_action").using(
			"btree",
			table.actionType.asc().nullsLast(),
		),
		index("idx_user_activity_agency").using(
			"btree",
			table.agencyId.asc().nullsLast(),
		),
		index("idx_user_activity_customer").using(
			"btree",
			table.customerId.asc().nullsLast(),
		),
		index("idx_user_activity_date").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_user_activity_user").using(
			"btree",
			table.userId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_activity_log_user_id_fkey",
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
	],
);

export const goodsTypes = pgTable(
	"goods_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_goods_types_name").using("btree", table.name.asc().nullsLast()),
		unique("goods_types_name_key").on(table.name),
	],
);

export const goods = pgTable(
	"goods",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
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
		index("idx_goods_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_goods_name").using("btree", table.name.asc().nullsLast()),
		index("idx_goods_type").using("btree", table.goodsTypeId.asc().nullsLast()),
		index("idx_goods_type_active")
			.using("btree", table.goodsTypeId.asc().nullsLast())
			.where(sql`(is_active = true)`),
		foreignKey({
			columns: [table.goodsTypeId],
			foreignColumns: [goodsTypes.id],
			name: "goods_goods_type_id_fkey",
		}),
		unique("goods_goods_code_key").on(table.goodsCode),
	],
);

export const parametrization = pgTable(
	"parametrization",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		goodsTypeId: bigint("goods_type_id", { mode: "number" }).notNull(),
		attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
		isRequired: boolean("is_required").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_parametrization_attribute").using(
			"btree",
			table.attributeId.asc().nullsLast(),
		),
		index("idx_parametrization_goods_type").using(
			"btree",
			table.goodsTypeId.asc().nullsLast(),
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
		unique("parametrization_goods_type_id_attribute_id_key").on(
			table.goodsTypeId,
			table.attributeId,
		),
	],
);

export const attributes = pgTable(
	"attributes",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		dataType: varchar("data_type", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_attributes_name").using("btree", table.name.asc().nullsLast()),
		index("idx_attributes_type").using(
			"btree",
			table.dataType.asc().nullsLast(),
		),
		unique("attributes_name_key").on(table.name),
		check(
			"attributes_data_type_check",
			sql`(data_type)::text = ANY ((ARRAY['string'::character varying, 'number'::character varying, 'date'::character varying, 'boolean'::character varying, 'decimal'::character varying])::text[])`,
		),
	],
);

export const stations = pgTable(
	"stations",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		address: varchar({ length: 500 }),
		city: varchar({ length: 100 }),
		stationCode: varchar("station_code", { length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_stations_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_stations_city").using("btree", table.city.asc().nullsLast()),
		index("idx_stations_name").using("btree", table.name.asc().nullsLast()),
		unique("stations_name_key").on(table.name),
		unique("stations_station_code_key").on(table.stationCode),
	],
);

export const ports = pgTable(
	"ports",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		type: varchar({ length: 20 }).notNull(),
		city: varchar({ length: 100 }),
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
		index("idx_ports_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_ports_city").using("btree", table.city.asc().nullsLast()),
		index("idx_ports_name").using("btree", table.name.asc().nullsLast()),
		index("idx_ports_station").using(
			"btree",
			table.stationId.asc().nullsLast(),
		),
		index("idx_ports_type").using("btree", table.type.asc().nullsLast()),
		foreignKey({
			columns: [table.stationId],
			foreignColumns: [stations.id],
			name: "ports_station_id_fkey",
		}),
		unique("ports_name_key").on(table.name),
		check(
			"ports_type_check",
			sql`(type)::text = ANY ((ARRAY['normal'::character varying, 'sec'::character varying])::text[])`,
		),
	],
);

export const berths = pgTable(
	"berths",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		portId: bigint("port_id", { mode: "number" }).notNull(),
		name: varchar({ length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_berths_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_berths_name").using("btree", table.name.asc().nullsLast()),
		index("idx_berths_port").using("btree", table.portId.asc().nullsLast()),
		index("idx_berths_port_active")
			.using("btree", table.portId.asc().nullsLast())
			.where(sql`(is_active = true)`),
		foreignKey({
			columns: [table.portId],
			foreignColumns: [ports.id],
			name: "berths_port_id_fkey",
		}).onDelete("cascade"),
	],
);

export const rejectionReasons = pgTable(
	"rejection_reasons",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 300 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_rejection_reasons_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("rejection_reasons_name_key").on(table.name),
	],
);

export const accessoryOperations = pgTable(
	"accessory_operations",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_accessory_operations_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("accessory_operations_name_key").on(table.name),
	],
);

export const shippingCompanies = pgTable(
	"shipping_companies",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_shipping_companies_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_shipping_companies_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("shipping_companies_name_key").on(table.name),
	],
);

export const vessels = pgTable(
	"vessels",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_vessels_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_vessels_name").using("btree", table.name.asc().nullsLast()),
		unique("vessels_name_key").on(table.name),
	],
);

export const importers = pgTable(
	"importers",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_importers_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_importers_name").using("btree", table.name.asc().nullsLast()),
		unique("importers_name_key").on(table.name),
	],
);

export const representatives = pgTable(
	"representatives",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_representatives_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_representatives_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("representatives_name_key").on(table.name),
	],
);

export const customerParametrization = pgTable(
	"customer_parametrization",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		customerCode: varchar("customer_code", { length: 50 }).notNull(),
		type: varchar({ length: 50 }).notNull(),
		portName: varchar("port_name", { length: 50 }),
		terminalName: varchar("terminal_name", { length: 100 }),
		supervisor: varchar({ length: 255 }),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_customer_parametrization_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_customer_parametrization_code").using(
			"btree",
			table.customerCode.asc().nullsLast(),
		),
		index("idx_customer_parametrization_type").using(
			"btree",
			table.type.asc().nullsLast(),
		),
		unique(
			"customer_parametrization_customer_code_type_port_name_termi_key",
		).on(table.customerCode, table.type, table.portName, table.terminalName),
	],
);

export const programStatus = pgTable(
	"program_status",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_program_status_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("program_status_name_key").on(table.name),
	],
);

export const orders = pgTable(
	"orders",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),

		customerId: bigint("customer_id", { mode: "number" }).notNull(),

		createdByUserId: bigint("created_by_user_id", {
			mode: "number",
		}).notNull(),

		goodsId: bigint("goods_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),

		supervisor: varchar({ length: 200 }),
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

		departureStationId: bigint("departure_station_id", {
			mode: "number",
		}),

		debtorCustomerId: bigint("debtor_customer_id", {
			mode: "number",
		}),

		pickupLocationTypeId: bigint("pickup_location_type_id", {
			mode: "number",
		}),

		dispatchTypeId: bigint("dispatch_type_id", {
			mode: "number",
		}),

		destinationCustomerId: bigint("destination_customer_id", {
			mode: "number",
		}),

		arrivalStationId: bigint("arrival_station_id", {
			mode: "number",
		}),

		deliveryLocationTypeId: bigint("delivery_location_type_id", {
			mode: "number",
		}),

		pickupPortId: bigint("pickup_port_id", {
			mode: "number",
		}),

		pickupBerthId: bigint("pickup_berth_id", {
			mode: "number",
		}),

		pickupSidingId: bigint("pickup_siding_id", {
			mode: "number",
		}),

		deliveryPortId: bigint("delivery_port_id", {
			mode: "number",
		}),

		deliveryBerthId: bigint("delivery_berth_id", {
			mode: "number",
		}),

		deliverySidingId: bigint("delivery_siding_id", {
			mode: "number",
		}),

		remarks: text(),

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
		index("idx_orders_arrival_station").using(
			"btree",
			table.arrivalStationId.asc().nullsLast(),
		),

		index("idx_orders_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),

		index("idx_orders_customer").using(
			"btree",
			table.customerId.asc().nullsLast(),
		),

		index("idx_orders_customer_status").using(
			"btree",
			table.customerId.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
		),

		index("idx_orders_date").using("btree", table.orderDate.asc().nullsLast()),

		index("idx_orders_date_range_status").using(
			"btree",
			table.startDate.asc().nullsLast(),
			table.endDate.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
		),

		index("idx_orders_debtor_customer").using(
			"btree",
			table.debtorCustomerId.asc().nullsLast(),
		),

		index("idx_orders_delivery_location_type").using(
			"btree",
			table.deliveryLocationTypeId.asc().nullsLast(),
		),

		index("idx_orders_departure_station").using(
			"btree",
			table.departureStationId.asc().nullsLast(),
		),

		index("idx_orders_destination_customer").using(
			"btree",
			table.destinationCustomerId.asc().nullsLast(),
		),

		index("idx_orders_dispatch_type").using(
			"btree",
			table.dispatchTypeId.asc().nullsLast(),
		),

		index("idx_orders_dtm_sync").using(
			"btree",
			table.statusId.asc().nullsLast(),
		),

		index("idx_orders_end").using("btree", table.endDate.asc().nullsLast()),

		index("idx_orders_goods").using("btree", table.goodsId.asc().nullsLast()),

		index("idx_orders_movement_type").using(
			"btree",
			table.movementTypeId.asc().nullsLast(),
		),

		index("idx_orders_number")
			.using("btree", table.orderNumber.asc().nullsLast())
			.where(sql`(order_number IS NOT NULL)`),

		index("idx_orders_parent").using(
			"btree",
			table.parentOrderId.asc().nullsLast(),
		),

		index("idx_orders_pickup_location_type").using(
			"btree",
			table.pickupLocationTypeId.asc().nullsLast(),
		),

		index("idx_orders_quantities").using(
			"btree",
			table.quantityDemanded.asc().nullsLast(),
			table.quantityAchieved.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
		),

		index("idx_orders_start").using("btree", table.startDate.asc().nullsLast()),

		index("idx_orders_status").using("btree", table.statusId.asc().nullsLast()),

		index("idx_orders_tc_export")
			.using(
				"btree",
				table.goodsId.asc().nullsLast(),
				table.movementTypeId.asc().nullsLast(),
				table.statusId.asc().nullsLast(),
			)
			.where(sql`(parent_order_id IS NULL)`),

		index("idx_orders_created_by_user").using(
			"btree",
			table.createdByUserId.asc().nullsLast(),
		),

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

		unique("orders_order_number_key").on(table.orderNumber),
	],
);

export const orderStatus = pgTable(
	"order_status",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_order_status_name").using("btree", table.name.asc().nullsLast()),
		unique("order_status_name_key").on(table.name),
	],
);

export const movementTypes = pgTable(
	"movement_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 50 }).notNull(),
		description: varchar({ length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_movement_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("movement_types_name_key").on(table.name),
	],
);

export const units = pgTable(
	"units",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_units_name").using("btree", table.name.asc().nullsLast()),
		unique("units_name_key").on(table.name),
	],
);

export const pickupLocationTypes = pgTable(
	"pickup_location_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 50 }).notNull(),
		description: varchar({ length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_pickup_location_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("pickup_location_types_name_key").on(table.name),
	],
);

export const dispatchTypes = pgTable(
	"dispatch_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 50 }).notNull(),
		description: varchar({ length: 200 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_dispatch_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("dispatch_types_name_key").on(table.name),
	],
);

export const sidings = pgTable(
	"sidings",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 200 }).notNull(),
		city: varchar({ length: 100 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_sidings_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_sidings_city").using("btree", table.city.asc().nullsLast()),
		index("idx_sidings_name").using("btree", table.name.asc().nullsLast()),
		unique("sidings_name_key").on(table.name),
	],
);

export const forecastProgramHistory = pgTable(
	"forecast_program_history",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		programId: bigint("program_id", { mode: "number" }),
		oldQuantity: numeric("old_quantity", { precision: 18, scale: 3 }),
		newQuantity: numeric("new_quantity", { precision: 18, scale: 3 }),
		changedBy: bigint("changed_by", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		reason: text(),
		eventType: varchar("event_type", { length: 50 }).notNull(),
		oldStatusId: bigint("old_status_id", { mode: "number" }),
		newStatusId: bigint("new_status_id", { mode: "number" }),
		oldPlannedDate: timestamp("old_planned_date", { mode: "string" }),
		newPlannedDate: timestamp("new_planned_date", { mode: "string" }),
		quantityRealized: numeric("quantity_realized", { precision: 18, scale: 3 }),
		completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
		deviationReason: text("deviation_reason"),
		changedByName: varchar("changed_by_name", { length: 200 }),
	},
	(table) => [
		index("idx_fp_history_date").using(
			"btree",
			table.changedAt.asc().nullsLast(),
		),
		index("idx_fp_history_event_type").using(
			"btree",
			table.eventType.asc().nullsLast(),
		),
		index("idx_fp_history_new_status").using(
			"btree",
			table.newStatusId.asc().nullsLast(),
		),
		index("idx_fp_history_old_status").using(
			"btree",
			table.oldStatusId.asc().nullsLast(),
		),
		index("idx_fp_history_program").using(
			"btree",
			table.programId.asc().nullsLast(),
		),
		index("idx_fp_history_user").using(
			"btree",
			table.changedBy.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.programId],
			foreignColumns: [forecastPrograms.id],
			name: "forecast_program_history_program_id_fkey",
		}).onDelete("set null"),
		foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "forecast_program_history_changed_by_fkey",
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
			sql`(event_type)::text = ANY ((ARRAY['CREATED'::character varying, 'QUANTITY_MODIFIED'::character varying, 'DATE_MODIFIED'::character varying, 'STATUS_CHANGED'::character varying, 'EXECUTION_RECORDED'::character varying, 'DELETED'::character varying])::text[])`,
		),
	],
);

export const orderAttributes = pgTable(
	"order_attributes",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		attributeId: bigint("attribute_id", { mode: "number" }).notNull(),
		value: text(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_order_attributes_attribute").using(
			"btree",
			table.attributeId.asc().nullsLast(),
		),
		index("idx_order_attributes_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
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
		unique("order_attributes_order_id_attribute_id_key").on(
			table.orderId,
			table.attributeId,
		),
	],
);

export const orderStatusHistory = pgTable(
	"order_status_history",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		changedById: bigint("changed_by_id", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		comment: text(),
		rejectionReasonId: bigint("rejection_reason_id", { mode: "number" }),
	},
	(table) => [
		index("idx_order_status_history_date").using(
			"btree",
			table.changedAt.asc().nullsLast(),
		),
		index("idx_order_status_history_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_status_history_status").using(
			"btree",
			table.statusId.asc().nullsLast(),
		),
		index("idx_order_status_history_user").using(
			"btree",
			table.changedById.asc().nullsLast(),
		),
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
	],
);

export const orderAccessoryOperations = pgTable(
	"order_accessory_operations",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		operationId: bigint("operation_id", { mode: "number" }).notNull(),
		status: varchar({ length: 50 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_order_operations_operation").using(
			"btree",
			table.operationId.asc().nullsLast(),
		),
		index("idx_order_operations_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_operations_status").using(
			"btree",
			table.status.asc().nullsLast(),
		),
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
	],
);

export const forecastPrograms = pgTable(
	"forecast_programs",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		plannedDate: timestamp("planned_date", { mode: "string" }).notNull(),
		quantityPlanned: numeric("quantity_planned", {
			precision: 18,
			scale: 3,
		}).notNull(),
		createdBy: bigint("created_by", { mode: "number" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		sentToDtmAt: timestamp("sent_to_dtm_at", { mode: "string" }),
		quantityRealized: numeric("quantity_realized", { precision: 18, scale: 3 }),
		deviationReason: text("deviation_reason"),
		realizedAt: timestamp("realized_at", { mode: "string" }),
		realizedBy: bigint("realized_by", { mode: "number" }),
		programNumber: varchar("program_number", { length: 30 }).notNull(),
		dtmStatus: varchar("dtm_status", { length: 50 }),
	},
	(table) => [
		index("idx_forecast_programs_date").using(
			"btree",
			table.plannedDate.asc().nullsLast(),
		),
		index("idx_forecast_programs_dtm_sync")
			.using(
				"btree",
				table.sentToDtmAt.asc().nullsLast(),
				table.statusId.asc().nullsLast(),
			)
			.where(sql`(sent_to_dtm_at IS NOT NULL)`),
		index("idx_forecast_programs_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_forecast_programs_order_date").using(
			"btree",
			table.orderId.asc().nullsLast(),
			table.plannedDate.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
		),
		index("idx_forecast_programs_sent").using(
			"btree",
			table.sentToDtmAt.asc().nullsLast(),
		),
		index("idx_forecast_programs_status").using(
			"btree",
			table.statusId.asc().nullsLast(),
		),
		index("idx_forecast_programs_user").using(
			"btree",
			table.createdBy.asc().nullsLast(),
		),
		index("idx_fp_realized_at").using(
			"btree",
			table.realizedAt.asc().nullsLast(),
		),
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
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "forecast_programs_created_by_fkey",
		}),
		foreignKey({
			columns: [table.realizedBy],
			foreignColumns: [users.id],
			name: "forecast_programs_realized_by_fkey",
		}),
		unique("forecast_programs_program_number_key").on(table.programNumber),
	],
);

export const orderExecutions = pgTable(
	"order_executions",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		executionDate: timestamp("execution_date", { mode: "string" }).notNull(),
		quantityExecuted: numeric("quantity_executed", {
			precision: 18,
			scale: 3,
		}).notNull(),
		completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
		comment: text(),
		executedBy: bigint("executed_by", { mode: "number" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_executions_date_user").using(
			"btree",
			table.executionDate.asc().nullsLast(),
			table.executedBy.asc().nullsLast(),
		),
		index("idx_executions_order_date").using(
			"btree",
			table.orderId.asc().nullsLast(),
			table.executionDate.desc().nullsFirst(),
		),
		index("idx_order_executions_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_order_executions_date").using(
			"btree",
			table.executionDate.asc().nullsLast(),
		),
		index("idx_order_executions_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_executions_user").using(
			"btree",
			table.executedBy.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_executions_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.executedBy],
			foreignColumns: [users.id],
			name: "order_executions_executed_by_fkey",
		}),
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
		uploadedBy: bigint("uploaded_by", { mode: "number" }).notNull(),
		uploadedAt: timestamp("uploaded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		description: varchar({ length: 500 }),
	},
	(table) => [
		index("idx_order_files_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_files_type").using(
			"btree",
			table.fileType.asc().nullsLast(),
		),
		index("idx_order_files_uploaded").using(
			"btree",
			table.uploadedAt.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_files_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "order_files_uploaded_by_fkey",
		}),
	],
);

export const orderShares = pgTable(
	"order_shares",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		agencyId: bigint("agency_id", { mode: "number" }).notNull(),
		sharedByUserId: bigint("shared_by_user_id", { mode: "number" }).notNull(),
		sharedAt: timestamp("shared_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		note: varchar({ length: 500 }),
	},
	(table) => [
		index("idx_order_shares_agency").using(
			"btree",
			table.agencyId.asc().nullsLast(),
		),
		index("idx_order_shares_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_shares_user").using(
			"btree",
			table.sharedByUserId.asc().nullsLast(),
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
		unique("order_shares_order_id_agency_id_key").on(
			table.orderId,
			table.agencyId,
		),
	],
);

export const orderDateModifications = pgTable(
	"order_date_modifications",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		modifiedById: bigint("modified_by_id", { mode: "number" }).notNull(),
		modifiedAt: timestamp("modified_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		oldStartDate: timestamp("old_start_date", { mode: "string" }),
		newStartDate: timestamp("new_start_date", { mode: "string" }),
		comment: varchar({ length: 500 }),
	},
	(table) => [
		index("idx_order_date_modifications_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_date_modifications_order_id_fkey",
		}),
		foreignKey({
			columns: [table.modifiedById],
			foreignColumns: [users.id],
			name: "order_date_modifications_modified_by_id_fkey",
		}),
	],
);

export const claimFiles = pgTable(
	"claim_files",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		filePath: varchar("file_path", { length: 500 }).notNull(),
		fileName: varchar("file_name", { length: 255 }).notNull(),
		fileType: varchar("file_type", { length: 100 }),
		uploadedBy: bigint("uploaded_by", { mode: "number" }).notNull(),
		uploadedAt: timestamp("uploaded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_claim_files_claim").using(
			"btree",
			table.claimId.asc().nullsLast(),
		),
		index("idx_claim_files_uploaded").using(
			"btree",
			table.uploadedAt.asc().nullsLast(),
		),
		index("idx_claim_files_user").using(
			"btree",
			table.uploadedBy.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_files_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "claim_files_uploaded_by_fkey",
		}),
	],
);

export const claims = pgTable(
	"claims",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		customerId: bigint("customer_id", { mode: "number" }).notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		orderId: bigint("order_id", { mode: "number" }),
		operationId: bigint("operation_id", { mode: "number" }),
		typeId: bigint("type_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		priority: varchar({ length: 20 }),
		description: text().notNull(),
		resolution: varchar({ length: 1000 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		closedBy: bigint("closed_by", { mode: "number" }),
		closedAt: timestamp("closed_at", { mode: "string" }),
	},
	(table) => [
		index("idx_claims_closed").using("btree", table.closedAt.asc().nullsLast()),
		index("idx_claims_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_claims_customer").using(
			"btree",
			table.customerId.asc().nullsLast(),
		),
		index("idx_claims_customer_status").using(
			"btree",
			table.customerId.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
			table.createdAt.desc().nullsFirst(),
		),
		index("idx_claims_operation").using(
			"btree",
			table.operationId.asc().nullsLast(),
		),
		index("idx_claims_order").using("btree", table.orderId.asc().nullsLast()),
		index("idx_claims_order_status")
			.using(
				"btree",
				table.orderId.asc().nullsLast(),
				table.statusId.asc().nullsLast(),
			)
			.where(sql`(order_id IS NOT NULL)`),
		index("idx_claims_priority").using(
			"btree",
			table.priority.asc().nullsLast(),
		),
		index("idx_claims_priority_status").using(
			"btree",
			table.priority.asc().nullsLast(),
			table.statusId.asc().nullsLast(),
			table.createdAt.desc().nullsFirst(),
		),
		index("idx_claims_status").using("btree", table.statusId.asc().nullsLast()),
		index("idx_claims_type").using("btree", table.typeId.asc().nullsLast()),
		index("idx_claims_user").using("btree", table.userId.asc().nullsLast()),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "claims_customer_id_fkey",
		}),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "claims_user_id_fkey",
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
			columns: [table.closedBy],
			foreignColumns: [users.id],
			name: "claims_closed_by_fkey",
		}),
		check(
			"claims_priority_check",
			sql`(priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[])`,
		),
	],
);

export const claimTypes = pgTable(
	"claim_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_claim_types_name").using("btree", table.name.asc().nullsLast()),
		unique("claim_types_name_key").on(table.name),
	],
);

export const claimStatus = pgTable(
	"claim_status",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_claim_status_name").using("btree", table.name.asc().nullsLast()),
		unique("claim_status_name_key").on(table.name),
	],
);

export const claimStatusHistory = pgTable(
	"claim_status_history",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).notNull(),
		changedBy: bigint("changed_by", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		comment: text(),
	},
	(table) => [
		index("idx_claim_status_history_claim").using(
			"btree",
			table.claimId.asc().nullsLast(),
		),
		index("idx_claim_status_history_date").using(
			"btree",
			table.changedAt.asc().nullsLast(),
		),
		index("idx_claim_status_history_status").using(
			"btree",
			table.statusId.asc().nullsLast(),
		),
		index("idx_claim_status_history_user").using(
			"btree",
			table.changedBy.asc().nullsLast(),
		),
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
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "claim_status_history_changed_by_fkey",
		}),
	],
);

export const claimComments = pgTable(
	"claim_comments",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		claimId: bigint("claim_id", { mode: "number" }).notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		comment: text().notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_claim_comments_claim").using(
			"btree",
			table.claimId.asc().nullsLast(),
		),
		index("idx_claim_comments_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_claim_comments_user").using(
			"btree",
			table.userId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.claimId],
			foreignColumns: [claims.id],
			name: "claim_comments_claim_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "claim_comments_user_id_fkey",
		}),
	],
);

export const trains = pgTable(
	"trains",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		externalId: varchar("external_id", { length: 100 }),
		trainNumber: varchar("train_number", { length: 50 }).notNull(),
		status: varchar({ length: 50 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_trains_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_trains_external").using(
			"btree",
			table.externalId.asc().nullsLast(),
		),
		index("idx_trains_number").using(
			"btree",
			table.trainNumber.asc().nullsLast(),
		),
		index("idx_trains_status").using("btree", table.status.asc().nullsLast()),
		unique("trains_external_id_key").on(table.externalId),
		unique("trains_train_number_key").on(table.trainNumber),
	],
);

export const trainWagons = pgTable(
	"train_wagons",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		attachedAt: timestamp("attached_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		detachedAt: timestamp("detached_at", { mode: "string" }),
	},
	(table) => [
		index("idx_train_wagons_attached").using(
			"btree",
			table.attachedAt.asc().nullsLast(),
		),
		index("idx_train_wagons_detached").using(
			"btree",
			table.detachedAt.asc().nullsLast(),
		),
		index("idx_train_wagons_train").using(
			"btree",
			table.trainId.asc().nullsLast(),
		),
		index("idx_train_wagons_wagon").using(
			"btree",
			table.wagonId.asc().nullsLast(),
		),
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
	],
);

export const wagons = pgTable(
	"wagons",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		externalId: varchar("external_id", { length: 100 }),
		wagonNumber: varchar("wagon_number", { length: 50 }).notNull(),
		type: varchar({ length: 100 }),
		capacity: numeric({ precision: 18, scale: 3 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_wagons_active").using("btree", table.isActive.asc().nullsLast()),
		index("idx_wagons_external").using(
			"btree",
			table.externalId.asc().nullsLast(),
		),
		index("idx_wagons_number").using(
			"btree",
			table.wagonNumber.asc().nullsLast(),
		),
		index("idx_wagons_type").using("btree", table.type.asc().nullsLast()),
		unique("wagons_external_id_key").on(table.externalId),
		unique("wagons_wagon_number_key").on(table.wagonNumber),
	],
);

export const orderWagons = pgTable(
	"order_wagons",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
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
		index("idx_order_wagons_order").using(
			"btree",
			table.orderId.asc().nullsLast(),
		),
		index("idx_order_wagons_program").using(
			"btree",
			table.forecastProgramId.asc().nullsLast(),
		),
		index("idx_order_wagons_train").using(
			"btree",
			table.trainId.asc().nullsLast(),
		),
		index("idx_order_wagons_wagon").using(
			"btree",
			table.wagonId.asc().nullsLast(),
		),
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
		foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_wagons_order_id_fkey",
		}).onDelete("cascade"),
	],
);

export const wagonTracking = pgTable(
	"wagon_tracking",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		latitude: numeric({ precision: 10, scale: 8 }),
		longitude: numeric({ precision: 11, scale: 8 }),
		status: varchar({ length: 50 }),
		recordedAt: timestamp("recorded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_wagon_tracking_cleanup").using(
			"btree",
			table.recordedAt.asc().nullsLast(),
		),
		index("idx_wagon_tracking_location").using(
			"btree",
			table.latitude.asc().nullsLast(),
			table.longitude.asc().nullsLast(),
		),
		index("idx_wagon_tracking_recorded").using(
			"btree",
			table.recordedAt.asc().nullsLast(),
		),
		index("idx_wagon_tracking_status").using(
			"btree",
			table.status.asc().nullsLast(),
		),
		index("idx_wagon_tracking_wagon").using(
			"btree",
			table.wagonId.asc().nullsLast(),
		),
		index("idx_wagon_tracking_wagon_date").using(
			"btree",
			table.wagonId.asc().nullsLast(),
			table.recordedAt.desc().nullsFirst(),
		),
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_tracking_wagon_id_fkey",
		}),
	],
);

export const trainTracking = pgTable(
	"train_tracking",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		latitude: numeric({ precision: 10, scale: 8 }),
		longitude: numeric({ precision: 11, scale: 8 }),
		status: varchar({ length: 50 }),
		recordedAt: timestamp("recorded_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_train_tracking_cleanup").using(
			"btree",
			table.recordedAt.asc().nullsLast(),
		),
		index("idx_train_tracking_location").using(
			"btree",
			table.latitude.asc().nullsLast(),
			table.longitude.asc().nullsLast(),
		),
		index("idx_train_tracking_recorded").using(
			"btree",
			table.recordedAt.asc().nullsLast(),
		),
		index("idx_train_tracking_status").using(
			"btree",
			table.status.asc().nullsLast(),
		),
		index("idx_train_tracking_train").using(
			"btree",
			table.trainId.asc().nullsLast(),
		),
		index("idx_train_tracking_train_date").using(
			"btree",
			table.trainId.asc().nullsLast(),
			table.recordedAt.desc().nullsFirst(),
		),
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_tracking_train_id_fkey",
		}),
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
		index("idx_wagon_current_status_location").using(
			"btree",
			table.lastLatitude.asc().nullsLast(),
			table.lastLongitude.asc().nullsLast(),
		),
		index("idx_wagon_current_status_status").using(
			"btree",
			table.lastStatus.asc().nullsLast(),
		),
		index("idx_wagon_current_status_update").using(
			"btree",
			table.lastUpdate.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_current_status_wagon_id_fkey",
		}).onDelete("cascade"),
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
		index("idx_train_current_status_location").using(
			"btree",
			table.lastLatitude.asc().nullsLast(),
			table.lastLongitude.asc().nullsLast(),
		),
		index("idx_train_current_status_status").using(
			"btree",
			table.lastStatus.asc().nullsLast(),
		),
		index("idx_train_current_status_update").using(
			"btree",
			table.lastUpdate.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_current_status_train_id_fkey",
		}).onDelete("cascade"),
	],
);

export const stationPassages = pgTable(
	"station_passages",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		stationId: bigint("station_id", { mode: "number" }).notNull(),
		arrivalTime: timestamp("arrival_time", { mode: "string" }),
		departureTime: timestamp("departure_time", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_station_passages_arrival").using(
			"btree",
			table.arrivalTime.asc().nullsLast(),
		),
		index("idx_station_passages_departure").using(
			"btree",
			table.departureTime.asc().nullsLast(),
		),
		index("idx_station_passages_station").using(
			"btree",
			table.stationId.asc().nullsLast(),
		),
		index("idx_station_passages_wagon").using(
			"btree",
			table.wagonId.asc().nullsLast(),
		),
		index("idx_station_passages_wagon_time").using(
			"btree",
			table.wagonId.asc().nullsLast(),
			table.arrivalTime.desc().nullsFirst(),
		),
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
	],
);

export const programConvoi = pgTable(
	"program_convoi",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		forecastProgramId: bigint("forecast_program_id", {
			mode: "number",
		}).notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		convoy: varchar({ length: 100 }).notNull(),
		status: varchar({ length: 50 }),
		since: timestamp({ mode: "string" }),
		quantity: numeric({ precision: 18, scale: 3 }),
		unit: varchar({ length: 20 }),
		wagonCount: integer("wagon_count"),
		eta: timestamp({ mode: "string" }),
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
		index("idx_program_convoi_program").using(
			"btree",
			table.forecastProgramId.asc().nullsLast(),
		),
		index("idx_program_convoi_train").using(
			"btree",
			table.trainId.asc().nullsLast(),
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
		unique("program_convoi_forecast_program_id_train_id_key").on(
			table.forecastProgramId,
			table.trainId,
		),
	],
);

export const notifications = pgTable(
	"notifications",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		typeId: bigint("type_id", { mode: "number" }).notNull(),
		channelId: bigint("channel_id", { mode: "number" }).notNull(),
		title: varchar({ length: 200 }).notNull(),
		message: text().notNull(),
		relatedEntityType: varchar("related_entity_type", { length: 50 }),
		relatedEntityId: bigint("related_entity_id", { mode: "number" }),
		status: varchar({ length: 20 }).notNull(),
		sentAt: timestamp("sent_at", { mode: "string" }),
		readAt: timestamp("read_at", { mode: "string" }),
		errorMessage: text("error_message"),
		retryCount: integer("retry_count").default(0),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_notifications_channel").using(
			"btree",
			table.channelId.asc().nullsLast(),
		),
		index("idx_notifications_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_notifications_entity").using(
			"btree",
			table.relatedEntityType.asc().nullsLast(),
			table.relatedEntityId.asc().nullsLast(),
		),
		index("idx_notifications_entity_user").using(
			"btree",
			table.relatedEntityType.asc().nullsLast(),
			table.relatedEntityId.asc().nullsLast(),
			table.userId.asc().nullsLast(),
		),
		index("idx_notifications_read").using(
			"btree",
			table.readAt.asc().nullsLast(),
		),
		index("idx_notifications_retry")
			.using(
				"btree",
				table.status.asc().nullsLast(),
				table.retryCount.asc().nullsLast(),
			)
			.where(sql`(((status)::text = 'FAILED'::text) AND (retry_count < 3))`),
		index("idx_notifications_sent").using(
			"btree",
			table.sentAt.asc().nullsLast(),
		),
		index("idx_notifications_status").using(
			"btree",
			table.status.asc().nullsLast(),
		),
		index("idx_notifications_type").using(
			"btree",
			table.typeId.asc().nullsLast(),
		),
		index("idx_notifications_user").using(
			"btree",
			table.userId.asc().nullsLast(),
		),
		index("idx_notifications_user_read").using(
			"btree",
			table.userId.asc().nullsLast(),
			table.readAt.asc().nullsLast(),
			table.createdAt.desc().nullsFirst(),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey",
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
			sql`(status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'FAILED'::character varying, 'READ'::character varying])::text[])`,
		),
	],
);

export const notificationTypes = pgTable(
	"notification_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_notification_types_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_notification_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("notification_types_name_key").on(table.name),
	],
);

export const notificationChannels = pgTable(
	"notification_channels",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 50 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_notification_channels_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_notification_channels_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("notification_channels_name_key").on(table.name),
	],
);

export const passwordResetTokens = pgTable(
	"password_reset_tokens",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		userId: bigint("user_id", { mode: "number" }).notNull(),
		token: varchar({ length: 100 }).notNull(),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		used: boolean().default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_password_reset_tokens_token").using(
			"btree",
			table.token.asc().nullsLast(),
		),
		index("idx_password_reset_tokens_user").using(
			"btree",
			table.userId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey",
		}).onDelete("cascade"),
		unique("password_reset_tokens_token_key").on(table.token),
	],
);

export const dtmRequestTypes = pgTable(
	"dtm_request_types",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar({ length: 500 }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_dtm_request_types_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_dtm_request_types_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		unique("dtm_request_types_name_key").on(table.name),
	],
);

export const dtmIntegrationLog = pgTable(
	"dtm_integration_log",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		requestTypeId: bigint("request_type_id", { mode: "number" }).notNull(),
		requestPayload: text("request_payload"),
		responsePayload: text("response_payload"),
		status: varchar({ length: 20 }).notNull(),
		httpStatusCode: integer("http_status_code"),
		errorMessage: text("error_message"),
		durationMs: integer("duration_ms"),
		relatedEntityType: varchar("related_entity_type", { length: 50 }),
		relatedEntityId: bigint("related_entity_id", { mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		createdBy: bigint("created_by", { mode: "number" }),
		retryCount: integer("retry_count").default(0).notNull(),
	},
	(table) => [
		index("idx_dtm_integration_log_created").using(
			"btree",
			table.createdAt.asc().nullsLast(),
		),
		index("idx_dtm_integration_log_entity").using(
			"btree",
			table.relatedEntityType.asc().nullsLast(),
			table.relatedEntityId.asc().nullsLast(),
		),
		index("idx_dtm_integration_log_http").using(
			"btree",
			table.httpStatusCode.asc().nullsLast(),
		),
		index("idx_dtm_integration_log_status").using(
			"btree",
			table.status.asc().nullsLast(),
		),
		index("idx_dtm_integration_log_type").using(
			"btree",
			table.requestTypeId.asc().nullsLast(),
		),
		index("idx_dtm_integration_log_user").using(
			"btree",
			table.createdBy.asc().nullsLast(),
		),
		index("idx_dtm_log_entity_date").using(
			"btree",
			table.relatedEntityType.asc().nullsLast(),
			table.relatedEntityId.asc().nullsLast(),
			table.createdAt.desc().nullsFirst(),
		),
		index("idx_dtm_log_failed")
			.using(
				"btree",
				table.status.asc().nullsLast(),
				table.createdAt.desc().nullsFirst(),
			)
			.where(
				sql`((status)::text = ANY ((ARRAY['FAILED'::character varying, 'TIMEOUT'::character varying])::text[]))`,
			),
		index("idx_dtm_log_performance").using(
			"btree",
			table.requestTypeId.asc().nullsLast(),
			table.durationMs.asc().nullsLast(),
			table.createdAt.desc().nullsFirst(),
		),
		foreignKey({
			columns: [table.requestTypeId],
			foreignColumns: [dtmRequestTypes.id],
			name: "dtm_integration_log_request_type_id_fkey",
		}),
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "dtm_integration_log_created_by_fkey",
		}),
		check(
			"dtm_integration_log_status_check",
			sql`(status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'TIMEOUT'::character varying, 'PENDING'::character varying])::text[])`,
		),
	],
);

export const wagonTrackingArchive = pgTable(
	"wagon_tracking_archive",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		wagonId: bigint("wagon_id", { mode: "number" }).notNull(),
		latitude: numeric({ precision: 10, scale: 8 }),
		longitude: numeric({ precision: 11, scale: 8 }),
		trackedAt: timestamp("tracked_at", { mode: "string" }).notNull(),
		archivedAt: timestamp("archived_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_wagon_tracking_archive_archived").using(
			"btree",
			table.archivedAt.asc().nullsLast(),
		),
		index("idx_wagon_tracking_archive_tracked").using(
			"btree",
			table.trackedAt.asc().nullsLast(),
		),
		index("idx_wagon_tracking_archive_wagon").using(
			"btree",
			table.wagonId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.wagonId],
			foreignColumns: [wagons.id],
			name: "wagon_tracking_archive_wagon_id_fkey",
		}),
	],
);

export const trainTrackingArchive = pgTable(
	"train_tracking_archive",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		trainId: bigint("train_id", { mode: "number" }).notNull(),
		latitude: numeric({ precision: 10, scale: 8 }),
		longitude: numeric({ precision: 11, scale: 8 }),
		trackedAt: timestamp("tracked_at", { mode: "string" }).notNull(),
		archivedAt: timestamp("archived_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index("idx_train_tracking_archive_archived").using(
			"btree",
			table.archivedAt.asc().nullsLast(),
		),
		index("idx_train_tracking_archive_tracked").using(
			"btree",
			table.trackedAt.asc().nullsLast(),
		),
		index("idx_train_tracking_archive_train").using(
			"btree",
			table.trainId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.trainId],
			foreignColumns: [trains.id],
			name: "train_tracking_archive_train_id_fkey",
		}),
	],
);

export const archivalExecutionLog = pgTable(
	"archival_execution_log",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
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
		index("idx_archival_log_started").using(
			"btree",
			table.startedAt.asc().nullsLast(),
		),
		index("idx_archival_log_status").using(
			"btree",
			table.executionStatus.asc().nullsLast(),
		),
		index("idx_archival_log_table").using(
			"btree",
			table.tableName.asc().nullsLast(),
		),
		index("idx_archival_log_triggered").using(
			"btree",
			table.triggeredBy.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.triggeredByUserId],
			foreignColumns: [users.id],
			name: "archival_execution_log_triggered_by_user_id_fkey",
		}),
		check(
			"archival_execution_log_execution_status_check",
			sql`(execution_status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'IN_PROGRESS'::character varying])::text[])`,
		),
		check(
			"archival_execution_log_triggered_by_check",
			sql`(triggered_by)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'MANUAL'::character varying])::text[])`,
		),
	],
);

export const loadingLocations = pgTable(
	"loading_locations",
	{
		id: bigserial({ mode: "number" }).primaryKey().notNull(),
		portId: bigint("port_id", { mode: "number" }).notNull(),
		name: varchar({ length: 200 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
	},
	(table) => [
		index("idx_loading_locations_active").using(
			"btree",
			table.isActive.asc().nullsLast(),
		),
		index("idx_loading_locations_name").using(
			"btree",
			table.name.asc().nullsLast(),
		),
		index("idx_loading_locations_port").using(
			"btree",
			table.portId.asc().nullsLast(),
		),
		foreignKey({
			columns: [table.portId],
			foreignColumns: [ports.id],
			name: "loading_locations_port_id_fkey",
		}).onDelete("cascade"),
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
