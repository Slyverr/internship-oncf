import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	foreignKey,
	index,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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
		id: uuid("id").primaryKey(),
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
		typeId: uuid("type_id"),
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
