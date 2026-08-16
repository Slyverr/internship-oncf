import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const ordersPart = defineRelationsPart(schema, (r) => ({
	orders: {
		parentOrder: r.one.orders({
			from: r.orders.parentOrderId,
			to: r.orders.id,
			alias: "parentOrder",
		}),
		childOrders: r.many.orders({
			from: r.orders.id,
			to: r.orders.parentOrderId,
			alias: "childOrders",
		}),
		unit: r.one.units({
			from: r.orders.unitId,
			to: r.units.id,
		}),
		good: r.one.goods({
			from: r.orders.goodsId,
			to: r.goods.id,
		}),
		customer: r.one.customers({
			from: r.orders.customerId,
			to: r.customers.id,
			alias: "customer",
		}),
		user: r.one.users({
			from: r.orders.userId,
			to: r.users.id,
		}),
		orderStatus: r.one.orderStatus({
			from: r.orders.statusId,
			to: r.orderStatus.id,
		}),
		movementType: r.one.movementTypes({
			from: r.orders.movementTypeId,
			to: r.movementTypes.id,
		}),
		departureStation: r.one.stations({
			from: r.orders.departureStationId,
			to: r.stations.id,
			alias: "departureStation",
		}),
		debtorCustomer: r.one.customers({
			from: r.orders.debtorCustomerId,
			to: r.customers.id,
			alias: "debtorCustomer",
		}),
		pickupLocationType: r.one.pickupLocationTypes({
			from: r.orders.pickupLocationTypeId,
			to: r.pickupLocationTypes.id,
			alias: "pickupLocationType",
		}),
		dispatchType: r.one.dispatchTypes({
			from: r.orders.dispatchTypeId,
			to: r.dispatchTypes.id,
		}),
		destinationCustomer: r.one.customers({
			from: r.orders.destinationCustomerId,
			to: r.customers.id,
			alias: "destinationCustomer",
		}),
		arrivalStation: r.one.stations({
			from: r.orders.arrivalStationId,
			to: r.stations.id,
			alias: "arrivalStation",
		}),
		deliveryLocationType: r.one.pickupLocationTypes({
			from: r.orders.deliveryLocationTypeId,
			to: r.pickupLocationTypes.id,
			alias: "deliveryLocationType",
		}),
		pickupPort: r.one.ports({
			from: r.orders.pickupPortId,
			to: r.ports.id,
			alias: "pickupPort",
		}),
		pickupBerth: r.one.berths({
			from: r.orders.pickupBerthId,
			to: r.berths.id,
			alias: "pickupBerth",
		}),
		pickupSiding: r.one.sidings({
			from: r.orders.pickupSidingId,
			to: r.sidings.id,
			alias: "pickupSiding",
		}),
		deliveryPort: r.one.ports({
			from: r.orders.deliveryPortId,
			to: r.ports.id,
			alias: "deliveryPort",
		}),
		deliveryBerth: r.one.berths({
			from: r.orders.deliveryBerthId,
			to: r.berths.id,
			alias: "deliveryBerth",
		}),
		deliverySiding: r.one.sidings({
			from: r.orders.deliverySidingId,
			to: r.sidings.id,
			alias: "deliverySiding",
		}),
		orderAttributes: r.many.orderAttributes({
			from: r.orders.id,
			to: r.orderAttributes.orderId,
		}),
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.orders.id,
			to: r.orderStatusHistory.orderId,
		}),
		orderAccessoryOperations: r.many.orderAccessoryOperations({
			from: r.orders.id,
			to: r.orderAccessoryOperations.orderId,
		}),
		forecastPrograms: r.many.forecastPrograms({
			from: r.orders.id,
			to: r.forecastPrograms.orderId,
		}),
		orderExecutions: r.many.orderExecutions({
			from: r.orders.id,
			to: r.orderExecutions.orderId,
		}),
		orderFiles: r.many.orderFiles({
			from: r.orders.id,
			to: r.orderFiles.orderId,
		}),
		orderShares: r.many.orderShares({
			from: r.orders.id,
			to: r.orderShares.orderId,
		}),
		orderDateModifications: r.many.orderDateModifications({
			from: r.orders.id,
			to: r.orderDateModifications.orderId,
		}),
		claims: r.many.claims({
			from: r.orders.id,
			to: r.claims.orderId,
		}),
		orderWagons: r.many.orderWagons({
			from: r.orders.id,
			to: r.orderWagons.orderId,
		}),
	},
}));

const orderAttributesPart = defineRelationsPart(schema, (r) => ({
	orderAttributes: {
		order: r.one.orders({
			from: r.orderAttributes.orderId,
			to: r.orders.id,
		}),
		attribute: r.one.attributes({
			from: r.orderAttributes.attributeId,
			to: r.attributes.id,
		}),
	},
}));

const orderStatusHistoryPart = defineRelationsPart(schema, (r) => ({
	orderStatusHistory: {
		order: r.one.orders({
			from: r.orderStatusHistory.orderId,
			to: r.orders.id,
		}),
		orderStatus: r.one.orderStatus({
			from: r.orderStatusHistory.statusId,
			to: r.orderStatus.id,
		}),
		user: r.one.users({
			from: r.orderStatusHistory.changedById,
			to: r.users.id,
		}),
		rejectionReason: r.one.rejectionReasons({
			from: r.orderStatusHistory.rejectionReasonId,
			to: r.rejectionReasons.id,
		}),
	},
}));

const orderAccessoryOperationsPart = defineRelationsPart(schema, (r) => ({
	orderAccessoryOperations: {
		order: r.one.orders({
			from: r.orderAccessoryOperations.orderId,
			to: r.orders.id,
		}),
		accessoryOperation: r.one.accessoryOperations({
			from: r.orderAccessoryOperations.operationId,
			to: r.accessoryOperations.id,
		}),
	},
}));

const orderExecutionsPart = defineRelationsPart(schema, (r) => ({
	orderExecutions: {
		order: r.one.orders({
			from: r.orderExecutions.orderId,
			to: r.orders.id,
		}),
		user: r.one.users({
			from: r.orderExecutions.executedBy,
			to: r.users.id,
		}),
	},
}));

const orderFilesPart = defineRelationsPart(schema, (r) => ({
	orderFiles: {
		order: r.one.orders({
			from: r.orderFiles.orderId,
			to: r.orders.id,
		}),
		user: r.one.users({
			from: r.orderFiles.uploadedBy,
			to: r.users.id,
		}),
	},
}));

const orderSharesPart = defineRelationsPart(schema, (r) => ({
	orderShares: {
		order: r.one.orders({
			from: r.orderShares.orderId,
			to: r.orders.id,
		}),
		agency: r.one.agencies({
			from: r.orderShares.agencyId,
			to: r.agencies.id,
		}),
		user: r.one.users({
			from: r.orderShares.sharedByUserId,
			to: r.users.id,
		}),
	},
}));

const orderDateModificationsPart = defineRelationsPart(schema, (r) => ({
	orderDateModifications: {
		order: r.one.orders({
			from: r.orderDateModifications.orderId,
			to: r.orders.id,
		}),
		user: r.one.users({
			from: r.orderDateModifications.modifiedById,
			to: r.users.id,
		}),
	},
}));

const orderWagonsPart = defineRelationsPart(schema, (r) => ({
	orderWagons: {
		wagon: r.one.wagons({
			from: r.orderWagons.wagonId,
			to: r.wagons.id,
		}),
		forecastProgram: r.one.forecastPrograms({
			from: r.orderWagons.forecastProgramId,
			to: r.forecastPrograms.id,
		}),
		train: r.one.trains({
			from: r.orderWagons.trainId,
			to: r.trains.id,
		}),
		order: r.one.orders({
			from: r.orderWagons.orderId,
			to: r.orders.id,
		}),
	},
}));

export const ordersRelations = {
	...ordersPart,
	...orderAttributesPart,
	...orderStatusHistoryPart,
	...orderAccessoryOperationsPart,
	...orderExecutionsPart,
	...orderFilesPart,
	...orderSharesPart,
	...orderDateModificationsPart,
	...orderWagonsPart,
};
