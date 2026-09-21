import { sql } from "drizzle-orm";
import {
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

export const goodsTypes = pgTable(
	"goods_types",
	{
		id: uuid("id").primaryKey(),
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
		goodsTypeId: uuid("goods_type_id").notNull(),
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
		id: uuid("id").primaryKey(),
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
		id: uuid("id").primaryKey(),
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
		goodsTypeId: uuid("goods_type_id").notNull(),
		attributeId: uuid("attribute_id").notNull(),
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
