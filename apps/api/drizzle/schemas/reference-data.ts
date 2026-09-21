import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	check,
	foreignKey,
	index,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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
		id: uuid("id").primaryKey(),
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
		id: uuid("id").primaryKey(),
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
		id: uuid("id").primaryKey(),
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
		id: uuid("id").primaryKey(),
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
		id: uuid("id").primaryKey(),
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
