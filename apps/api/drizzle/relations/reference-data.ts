import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const stationsPart = defineRelationsPart(schema, (r) => ({
	stations: {
		ports: r.many.ports({
			from: r.stations.id,
			to: r.ports.stationId,
		}),
		orders_departureStationId: r.many.orders({
			from: r.stations.id,
			to: r.orders.departureStationId,
			alias: "orders_departureStationId",
		}),
		orders_arrivalStationId: r.many.orders({
			from: r.stations.id,
			to: r.orders.arrivalStationId,
			alias: "orders_arrivalStationId",
		}),
		stationPassages: r.many.stationPassages({
			from: r.stations.id,
			to: r.stationPassages.stationId,
		}),
	},
}));

const portsPart = defineRelationsPart(schema, (r) => ({
	ports: {
		station: r.one.stations({
			from: r.ports.stationId,
			to: r.stations.id,
		}),
		berths: r.many.berths({
			from: r.ports.id,
			to: r.berths.portId,
		}),
		orders_pickupPortId: r.many.orders({
			from: r.ports.id,
			to: r.orders.pickupPortId,
			alias: "orders_pickupPortId",
		}),
		orders_deliveryPortId: r.many.orders({
			from: r.ports.id,
			to: r.orders.deliveryPortId,
			alias: "orders_deliveryPortId",
		}),
		loadingLocations: r.many.loadingLocations({
			from: r.ports.id,
			to: r.loadingLocations.portId,
		}),
	},
}));

const berthsPart = defineRelationsPart(schema, (r) => ({
	berths: {
		port: r.one.ports({
			from: r.berths.portId,
			to: r.ports.id,
		}),
		orders_pickupBerthId: r.many.orders({
			from: r.berths.id,
			to: r.orders.pickupBerthId,
			alias: "orders_pickupBerthId",
		}),
		orders_deliveryBerthId: r.many.orders({
			from: r.berths.id,
			to: r.orders.deliveryBerthId,
			alias: "orders_deliveryBerthId",
		}),
	},
}));

const sidingsPart = defineRelationsPart(schema, (r) => ({
	sidings: {
		orders_pickupSidingId: r.many.orders({
			from: r.sidings.id,
			to: r.orders.pickupSidingId,
			alias: "orders_pickupSidingId",
		}),
		orders_deliverySidingId: r.many.orders({
			from: r.sidings.id,
			to: r.orders.deliverySidingId,
			alias: "orders_deliverySidingId",
		}),
	},
}));

const movementTypesPart = defineRelationsPart(schema, (r) => ({
	movementTypes: {
		orders: r.many.orders({
			from: r.movementTypes.id,
			to: r.orders.movementTypeId,
		}),
	},
}));

const pickupLocationTypesPart = defineRelationsPart(schema, (r) => ({
	pickupLocationTypes: {
		orders_pickupLocationTypeId: r.many.orders({
			from: r.pickupLocationTypes.id,
			to: r.orders.pickupLocationTypeId,
			alias: "orders_pickupLocationTypeId",
		}),
		orders_deliveryLocationTypeId: r.many.orders({
			from: r.pickupLocationTypes.id,
			to: r.orders.deliveryLocationTypeId,
			alias: "orders_deliveryLocationTypeId",
		}),
	},
}));

const dispatchTypesPart = defineRelationsPart(schema, (r) => ({
	dispatchTypes: {
		orders: r.many.orders({
			from: r.dispatchTypes.id,
			to: r.orders.dispatchTypeId,
		}),
	},
}));

const orderStatusPart = defineRelationsPart(schema, (r) => ({
	orderStatus: {
		orders: r.many.orders({
			from: r.orderStatus.id,
			to: r.orders.statusId,
		}),
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.orderStatus.id,
			to: r.orderStatusHistory.statusId,
		}),
	},
}));

const rejectionReasonsPart = defineRelationsPart(schema, (r) => ({
	rejectionReasons: {
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.rejectionReasons.id,
			to: r.orderStatusHistory.rejectionReasonId,
		}),
	},
}));

const accessoryOperationsPart = defineRelationsPart(schema, (r) => ({
	accessoryOperations: {
		orderAccessoryOperations: r.many.orderAccessoryOperations({
			from: r.accessoryOperations.id,
			to: r.orderAccessoryOperations.operationId,
		}),
		claims: r.many.claims({
			from: r.accessoryOperations.id,
			to: r.claims.operationId,
		}),
	},
}));

const loadingLocationsPart = defineRelationsPart(schema, (r) => ({
	loadingLocations: {
		port: r.one.ports({
			from: r.loadingLocations.portId,
			to: r.ports.id,
		}),
	},
}));

export const referenceDataRelations = {
	...stationsPart,
	...portsPart,
	...berthsPart,
	...sidingsPart,
	...movementTypesPart,
	...pickupLocationTypesPart,
	...dispatchTypesPart,
	...orderStatusPart,
	...rejectionReasonsPart,
	...accessoryOperationsPart,
	...loadingLocationsPart,
};
