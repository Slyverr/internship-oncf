import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	customers: {
		customerType: r.one.customerTypes({
			from: r.customers.typeId,
			to: r.customerTypes.id,
		}),
		users: r.many.users({
			from: r.customers.id,
			to: r.users.customerId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.customers.id,
			to: r.userActivityLog.customerId,
		}),
		orders_customerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.customerId,
			alias: "orders_customerId",
		}),
		orders_debtorCustomerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.debtorCustomerId,
			alias: "orders_debtorCustomerId",
		}),
		orders_destinationCustomerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.destinationCustomerId,
			alias: "orders_destinationCustomerId",
		}),
		claims: r.many.claims({
			from: r.customers.id,
			to: r.claims.customerId,
		}),
		userCustomers: r.many.userCustomers({
			from: r.customers.id,
			to: r.userCustomers.customerId,
		}),
	},
	customerTypes: {
		customers: r.many.customers({
			from: r.customerTypes.id,
			to: r.customers.typeId,
		}),
	},
	centers: {
		agency: r.one.agencies({
			from: r.centers.agencyId,
			to: r.agencies.id,
		}),
	},
	agencies: {
		centers: r.many.centers({
			from: r.agencies.id,
			to: r.centers.agencyId,
		}),
		users: r.many.users({
			from: r.agencies.id,
			to: r.users.agencyId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.agencies.id,
			to: r.userActivityLog.agencyId,
		}),
		orderShares: r.many.orderShares({
			from: r.agencies.id,
			to: r.orderShares.agencyId,
		}),
	},
	users: {
		role: r.one.roles({
			from: r.users.roleId,
			to: r.roles.id,
		}),
		customer: r.one.customers({
			from: r.users.customerId,
			to: r.customers.id,
		}),
		agency: r.one.agencies({
			from: r.users.agencyId,
			to: r.agencies.id,
		}),
		userSessions: r.many.userSessions({
			from: r.users.id,
			to: r.userSessions.userId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.users.id,
			to: r.userActivityLog.userId,
		}),
		orders: r.many.orders({
			from: r.users.id,
			to: r.orders.userId,
		}),
		forecastProgramHistories: r.many.forecastProgramHistory({
			from: r.users.id,
			to: r.forecastProgramHistory.changedBy,
		}),
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.users.id,
			to: r.orderStatusHistory.changedById,
		}),
		forecastPrograms_createdBy: r.many.forecastPrograms({
			from: r.users.id,
			to: r.forecastPrograms.createdBy,
			alias: "forecastPrograms_createdBy",
		}),
		forecastPrograms_realizedBy: r.many.forecastPrograms({
			from: r.users.id,
			to: r.forecastPrograms.realizedBy,
			alias: "forecastPrograms_realizedBy",
		}),
		orderExecutions: r.many.orderExecutions({
			from: r.users.id,
			to: r.orderExecutions.executedBy,
		}),
		orderFiles: r.many.orderFiles({
			from: r.users.id,
			to: r.orderFiles.uploadedBy,
		}),
		orderShares: r.many.orderShares({
			from: r.users.id,
			to: r.orderShares.sharedByUserId,
		}),
		orderDateModifications: r.many.orderDateModifications({
			from: r.users.id,
			to: r.orderDateModifications.modifiedById,
		}),
		claimFiles: r.many.claimFiles({
			from: r.users.id,
			to: r.claimFiles.uploadedBy,
		}),
		claims_userId: r.many.claims({
			from: r.users.id,
			to: r.claims.userId,
			alias: "claims_userId",
		}),
		claims_closedBy: r.many.claims({
			from: r.users.id,
			to: r.claims.closedBy,
			alias: "claims_closedBy",
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.users.id,
			to: r.claimStatusHistory.changedBy,
		}),
		claimComments: r.many.claimComments({
			from: r.users.id,
			to: r.claimComments.userId,
		}),
		notifications: r.many.notifications({
			from: r.users.id,
			to: r.notifications.userId,
		}),
		passwordResetTokens: r.many.passwordResetTokens({
			from: r.users.id,
			to: r.passwordResetTokens.userId,
		}),
		dtmIntegrationLogs: r.many.dtmIntegrationLog({
			from: r.users.id,
			to: r.dtmIntegrationLog.createdBy,
		}),
		archivalExecutionLogs: r.many.archivalExecutionLog({
			from: r.users.id,
			to: r.archivalExecutionLog.triggeredByUserId,
		}),
		userCustomers: r.many.userCustomers({
			from: r.users.id,
			to: r.userCustomers.userId,
		}),
	},
	roles: {
		users: r.many.users({
			from: r.roles.id,
			to: r.users.roleId,
		}),
		rolePermissions: r.many.rolePermissions({
			from: r.roles.id,
			to: r.rolePermissions.roleId,
		}),
	},
	userSessions: {
		user: r.one.users({
			from: r.userSessions.userId,
			to: r.users.id,
		}),
	},
	userActivityLog: {
		user: r.one.users({
			from: r.userActivityLog.userId,
			to: r.users.id,
		}),
		customer: r.one.customers({
			from: r.userActivityLog.customerId,
			to: r.customers.id,
		}),
		agency: r.one.agencies({
			from: r.userActivityLog.agencyId,
			to: r.agencies.id,
		}),
	},
	goods: {
		goodsType: r.one.goodsTypes({
			from: r.goods.goodsTypeId,
			to: r.goodsTypes.id,
		}),
		orders: r.many.orders({
			from: r.goods.id,
			to: r.orders.goodsId,
		}),
	},
	goodsTypes: {
		goods: r.many.goods({
			from: r.goodsTypes.id,
			to: r.goods.goodsTypeId,
		}),
		parametrizations: r.many.parametrization({
			from: r.goodsTypes.id,
			to: r.parametrization.goodsTypeId,
		}),
	},
	parametrization: {
		goodsType: r.one.goodsTypes({
			from: r.parametrization.goodsTypeId,
			to: r.goodsTypes.id,
		}),
		attribute: r.one.attributes({
			from: r.parametrization.attributeId,
			to: r.attributes.id,
		}),
	},
	attributes: {
		parametrizations: r.many.parametrization({
			from: r.attributes.id,
			to: r.parametrization.attributeId,
		}),
		orderAttributes: r.many.orderAttributes({
			from: r.attributes.id,
			to: r.orderAttributes.attributeId,
		}),
	},
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
	units: {
		orders: r.many.orders({
			from: r.units.id,
			to: r.orders.unitId,
		}),
	},
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
	movementTypes: {
		orders: r.many.orders({
			from: r.movementTypes.id,
			to: r.orders.movementTypeId,
		}),
	},
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
	dispatchTypes: {
		orders: r.many.orders({
			from: r.dispatchTypes.id,
			to: r.orders.dispatchTypeId,
		}),
	},
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
	forecastProgramHistory: {
		forecastProgram: r.one.forecastPrograms({
			from: r.forecastProgramHistory.programId,
			to: r.forecastPrograms.id,
		}),
		user: r.one.users({
			from: r.forecastProgramHistory.changedBy,
			to: r.users.id,
		}),
		oldStatus: r.one.programStatus({
			from: r.forecastProgramHistory.oldStatusId,
			to: r.programStatus.id,
			alias: "oldStatus",
		}),
		newStatus: r.one.programStatus({
			from: r.forecastProgramHistory.newStatusId,
			to: r.programStatus.id,
			alias: "newStatus",
		}),
	},
	forecastPrograms: {
		forecastProgramHistories: r.many.forecastProgramHistory({
			from: r.forecastPrograms.id,
			to: r.forecastProgramHistory.programId,
		}),
		order: r.one.orders({
			from: r.forecastPrograms.orderId,
			to: r.orders.id,
		}),
		programStatus: r.one.programStatus({
			from: r.forecastPrograms.statusId,
			to: r.programStatus.id,
		}),
		createdByUser: r.one.users({
			from: r.forecastPrograms.createdBy,
			to: r.users.id,
			alias: "createdByUser",
		}),
		realizedByUser: r.one.users({
			from: r.forecastPrograms.realizedBy,
			to: r.users.id,
			alias: "realizedByUser",
		}),
		orderWagons: r.many.orderWagons({
			from: r.forecastPrograms.id,
			to: r.orderWagons.forecastProgramId,
		}),
		programConvois: r.many.programConvoi({
			from: r.forecastPrograms.id,
			to: r.programConvoi.forecastProgramId,
		}),
	},
	programStatus: {
		oldStatusHistories: r.many.forecastProgramHistory({
			from: r.programStatus.id,
			to: r.forecastProgramHistory.oldStatusId,
			alias: "oldStatusHistories",
		}),
		newStatusHistories: r.many.forecastProgramHistory({
			from: r.programStatus.id,
			to: r.forecastProgramHistory.newStatusId,
			alias: "newStatusHistories",
		}),
		forecastPrograms: r.many.forecastPrograms({
			from: r.programStatus.id,
			to: r.forecastPrograms.statusId,
		}),
	},
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
	rejectionReasons: {
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.rejectionReasons.id,
			to: r.orderStatusHistory.rejectionReasonId,
		}),
	},
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
	claimFiles: {
		claim: r.one.claims({
			from: r.claimFiles.claimId,
			to: r.claims.id,
		}),
		user: r.one.users({
			from: r.claimFiles.uploadedBy,
			to: r.users.id,
		}),
	},
	claims: {
		claimFiles: r.many.claimFiles({
			from: r.claims.id,
			to: r.claimFiles.claimId,
		}),
		customer: r.one.customers({
			from: r.claims.customerId,
			to: r.customers.id,
		}),
		user: r.one.users({
			from: r.claims.userId,
			to: r.users.id,
			alias: "user",
		}),
		order: r.one.orders({
			from: r.claims.orderId,
			to: r.orders.id,
		}),
		accessoryOperation: r.one.accessoryOperations({
			from: r.claims.operationId,
			to: r.accessoryOperations.id,
		}),
		claimType: r.one.claimTypes({
			from: r.claims.typeId,
			to: r.claimTypes.id,
		}),
		claimStatus: r.one.claimStatus({
			from: r.claims.statusId,
			to: r.claimStatus.id,
		}),
		closedByUser: r.one.users({
			from: r.claims.closedBy,
			to: r.users.id,
			alias: "closedBy",
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.claims.id,
			to: r.claimStatusHistory.claimId,
		}),
		claimComments: r.many.claimComments({
			from: r.claims.id,
			to: r.claimComments.claimId,
		}),
	},
	claimTypes: {
		claims: r.many.claims({
			from: r.claimTypes.id,
			to: r.claims.typeId,
		}),
	},
	claimStatus: {
		claims: r.many.claims({
			from: r.claimStatus.id,
			to: r.claims.statusId,
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.claimStatus.id,
			to: r.claimStatusHistory.statusId,
		}),
	},
	claimStatusHistory: {
		claim: r.one.claims({
			from: r.claimStatusHistory.claimId,
			to: r.claims.id,
		}),
		claimStatus: r.one.claimStatus({
			from: r.claimStatusHistory.statusId,
			to: r.claimStatus.id,
		}),
		user: r.one.users({
			from: r.claimStatusHistory.changedBy,
			to: r.users.id,
		}),
	},
	claimComments: {
		claim: r.one.claims({
			from: r.claimComments.claimId,
			to: r.claims.id,
		}),
		user: r.one.users({
			from: r.claimComments.userId,
			to: r.users.id,
		}),
	},
	trainWagons: {
		train: r.one.trains({
			from: r.trainWagons.trainId,
			to: r.trains.id,
		}),
		wagon: r.one.wagons({
			from: r.trainWagons.wagonId,
			to: r.wagons.id,
		}),
	},
	trains: {
		trainWagons: r.many.trainWagons({
			from: r.trains.id,
			to: r.trainWagons.trainId,
		}),
		orderWagons: r.many.orderWagons({
			from: r.trains.id,
			to: r.orderWagons.trainId,
		}),
		trainTrackings: r.many.trainTracking({
			from: r.trains.id,
			to: r.trainTracking.trainId,
		}),
		trainCurrentStatuses: r.many.trainCurrentStatus({
			from: r.trains.id,
			to: r.trainCurrentStatus.trainId,
		}),
		programConvois: r.many.programConvoi({
			from: r.trains.id,
			to: r.programConvoi.trainId,
		}),
		trainTrackingArchives: r.many.trainTrackingArchive({
			from: r.trains.id,
			to: r.trainTrackingArchive.trainId,
		}),
	},
	wagons: {
		trainWagons: r.many.trainWagons({
			from: r.wagons.id,
			to: r.trainWagons.wagonId,
		}),
		orderWagons: r.many.orderWagons({
			from: r.wagons.id,
			to: r.orderWagons.wagonId,
		}),
		wagonTrackings: r.many.wagonTracking({
			from: r.wagons.id,
			to: r.wagonTracking.wagonId,
		}),
		wagonCurrentStatuses: r.many.wagonCurrentStatus({
			from: r.wagons.id,
			to: r.wagonCurrentStatus.wagonId,
		}),
		stationPassages: r.many.stationPassages({
			from: r.wagons.id,
			to: r.stationPassages.wagonId,
		}),
		wagonTrackingArchives: r.many.wagonTrackingArchive({
			from: r.wagons.id,
			to: r.wagonTrackingArchive.wagonId,
		}),
	},
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
	wagonTracking: {
		wagon: r.one.wagons({
			from: r.wagonTracking.wagonId,
			to: r.wagons.id,
		}),
	},
	trainTracking: {
		train: r.one.trains({
			from: r.trainTracking.trainId,
			to: r.trains.id,
		}),
	},
	wagonCurrentStatus: {
		wagon: r.one.wagons({
			from: r.wagonCurrentStatus.wagonId,
			to: r.wagons.id,
		}),
	},
	trainCurrentStatus: {
		train: r.one.trains({
			from: r.trainCurrentStatus.trainId,
			to: r.trains.id,
		}),
	},
	stationPassages: {
		wagon: r.one.wagons({
			from: r.stationPassages.wagonId,
			to: r.wagons.id,
		}),
		station: r.one.stations({
			from: r.stationPassages.stationId,
			to: r.stations.id,
		}),
	},
	programConvoi: {
		forecastProgram: r.one.forecastPrograms({
			from: r.programConvoi.forecastProgramId,
			to: r.forecastPrograms.id,
		}),
		train: r.one.trains({
			from: r.programConvoi.trainId,
			to: r.trains.id,
		}),
	},
	notifications: {
		user: r.one.users({
			from: r.notifications.userId,
			to: r.users.id,
		}),
		notificationType: r.one.notificationTypes({
			from: r.notifications.typeId,
			to: r.notificationTypes.id,
		}),
		notificationChannel: r.one.notificationChannels({
			from: r.notifications.channelId,
			to: r.notificationChannels.id,
		}),
	},
	notificationTypes: {
		notifications: r.many.notifications({
			from: r.notificationTypes.id,
			to: r.notifications.typeId,
		}),
	},
	notificationChannels: {
		notifications: r.many.notifications({
			from: r.notificationChannels.id,
			to: r.notifications.channelId,
		}),
	},
	passwordResetTokens: {
		user: r.one.users({
			from: r.passwordResetTokens.userId,
			to: r.users.id,
		}),
	},
	dtmIntegrationLog: {
		dtmRequestType: r.one.dtmRequestTypes({
			from: r.dtmIntegrationLog.requestTypeId,
			to: r.dtmRequestTypes.id,
		}),
		user: r.one.users({
			from: r.dtmIntegrationLog.createdBy,
			to: r.users.id,
		}),
	},
	dtmRequestTypes: {
		dtmIntegrationLogs: r.many.dtmIntegrationLog({
			from: r.dtmRequestTypes.id,
			to: r.dtmIntegrationLog.requestTypeId,
		}),
	},
	wagonTrackingArchive: {
		wagon: r.one.wagons({
			from: r.wagonTrackingArchive.wagonId,
			to: r.wagons.id,
		}),
	},
	trainTrackingArchive: {
		train: r.one.trains({
			from: r.trainTrackingArchive.trainId,
			to: r.trains.id,
		}),
	},
	archivalExecutionLog: {
		user: r.one.users({
			from: r.archivalExecutionLog.triggeredByUserId,
			to: r.users.id,
		}),
	},
	loadingLocations: {
		port: r.one.ports({
			from: r.loadingLocations.portId,
			to: r.ports.id,
		}),
	},
	rolePermissions: {
		role: r.one.roles({
			from: r.rolePermissions.roleId,
			to: r.roles.id,
		}),
		permission: r.one.permissions({
			from: r.rolePermissions.permissionId,
			to: r.permissions.id,
		}),
	},
	permissions: {
		rolePermissions: r.many.rolePermissions({
			from: r.permissions.id,
			to: r.rolePermissions.permissionId,
		}),
	},
	userCustomers: {
		user: r.one.users({
			from: r.userCustomers.userId,
			to: r.users.id,
		}),
		customer: r.one.customers({
			from: r.userCustomers.customerId,
			to: r.customers.id,
		}),
	},
}));
