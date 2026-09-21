import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
	foreignKey,
	index,
	integer,
	numeric,
	pgTable,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { forecastPrograms } from "./forecast-programs";
import { orders } from "./orders";
import { stations } from "./reference-data";

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
