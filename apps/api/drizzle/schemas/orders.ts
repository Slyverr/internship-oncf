import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	boolean,
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
import { attachments } from "./attachments";
import { agencies, customers } from "./customers";
import { attributes, goods, units } from "./goods";
import { accessoryOperations, berths, dispatchTypes, movementTypes, pickupLocationTypes, ports, rejectionReasons, sidings, stations } from "./reference-data";
import { users } from "./users";

export const orderStatus = pgTable(
	"order_status",
	{
		id: uuid("id").primaryKey(),
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

export const orders = pgTable(
	"orders",
	{
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		goodsId: bigint("goods_id", { mode: "number" }).notNull(),
		customerId: bigint("customer_id", { mode: "number" }).notNull(),
		createdByUserId: bigint("created_by_user_id", { mode: "number" }).notNull(),
		statusId: uuid("status_id").notNull(),
		supervisor: varchar("supervisor", { length: 200 }),
		orderNumber: varchar("order_number", { length: 50 }).notNull(),
		movementTypeId: uuid("movement_type_id"),
		parentOrderId: bigint("parent_order_id", { mode: "number" }),
		quantityDemanded: numeric("quantity_demanded", {
			precision: 18,
			scale: 3,
		}).notNull(),
		quantityAchieved: numeric("quantity_achieved", {
			precision: 18,
			scale: 3,
		}).default("0"),
		unitId: uuid("unit_id").notNull(),
		departureStationId: bigint("departure_station_id", { mode: "number" }),
		debtorCustomerId: bigint("debtor_customer_id", { mode: "number" }),
		pickupLocationTypeId: uuid("pickup_location_type_id"),
		dispatchTypeId: uuid("dispatch_type_id"),
		destinationCustomerId: bigint("destination_customer_id", {
			mode: "number",
		}),
		arrivalStationId: bigint("arrival_station_id", { mode: "number" }),
		deliveryLocationTypeId: uuid("delivery_location_type_id"),
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
		attributeId: uuid("attribute_id").notNull(),
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
		statusId: uuid("status_id").notNull(),
		changedById: bigint("changed_by_id", { mode: "number" }).notNull(),
		changedAt: timestamp("changed_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		comment: text("comment"),
		rejectionReasonId: uuid("rejection_reason_id"),
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
		operationId: uuid("operation_id").notNull(),
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
		id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
		orderId: bigint("order_id", { mode: "number" }).notNull(),
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
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_files_order_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.attachmentId],
			foreignColumns: [attachments.id],
			name: "order_files_attachment_id_fkey",
		}),
		foreignKey({
			columns: [table.uploadedByUserId],
			foreignColumns: [users.id],
			name: "order_files_uploaded_by_user_id_fkey",
		}),
		index("idx_order_files_order").on(table.orderId, table.deletedAt),
		index("idx_order_files_attachment").on(table.attachmentId),
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
