import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const fkHandlers: Record<string, ConstraintHandler> = {
	customers_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_TYPE_NOT_FOUND,
		message: `Customer type #${ctx.typeId} does not exist`,
	}),
	centers_agency_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
		message: `Agency #${ctx.agencyId} does not exist`,
	}),
	users_role_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ROLE_NOT_FOUND,
		message: `Role #${ctx.roleId} does not exist`,
	}),
	users_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Customer #${ctx.customerId} does not exist`,
	}),
	users_agency_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
		message: `Agency #${ctx.agencyId} does not exist`,
	}),
	user_sessions_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	user_activity_log_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	user_activity_log_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Customer #${ctx.customerId} does not exist`,
	}),
	user_activity_log_agency_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
		message: `Agency #${ctx.agencyId} does not exist`,
	}),
	goods_goods_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_TYPE_NOT_FOUND,
		message: `Goods type #${ctx.goodsTypeId} does not exist`,
	}),
	parametrization_goods_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_TYPE_NOT_FOUND,
		message: `Goods type #${ctx.goodsTypeId} does not exist`,
	}),
	parametrization_attribute_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ATTRIBUTE_NOT_FOUND,
		message: `Attribute #${ctx.attributeId} does not exist`,
	}),
	ports_station_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
		message: `Station #${ctx.stationId} does not exist`,
	}),
	berths_port_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
		message: `Port #${ctx.portId} does not exist`,
	}),
	orders_parent_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PARENT_ORDER_NOT_FOUND,
		message: `Parent order #${ctx.parentOrderId} does not exist`,
	}),
	orders_unit_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.UNIT_NOT_FOUND,
		message: `Unit #${ctx.unitId} does not exist`,
	}),
	orders_goods_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_NOT_FOUND,
		message: `Goods #${ctx.goodsId} does not exist`,
	}),
	orders_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Customer #${ctx.customerId} does not exist`,
	}),
	orders_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	orders_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_STATUS_NOT_FOUND,
		message: `Order status #${ctx.statusId} does not exist`,
	}),
	orders_movement_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.MOVEMENT_TYPE_NOT_FOUND,
		message: `Movement type #${ctx.movementTypeId} does not exist`,
	}),
	orders_departure_station_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
		message: `Departure station #${ctx.departureStationId} does not exist`,
	}),
	orders_debtor_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Debtor customer #${ctx.debtorCustomerId} does not exist`,
	}),
	orders_pickup_location_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PICKUP_LOCATION_TYPE_NOT_FOUND,
		message: `Pickup location type #${ctx.pickupLocationTypeId} does not exist`,
	}),
	orders_dispatch_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.DISPATCH_TYPE_NOT_FOUND,
		message: `Dispatch type #${ctx.dispatchTypeId} does not exist`,
	}),
	orders_destination_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Destination customer #${ctx.destinationCustomerId} does not exist`,
	}),
	orders_arrival_station_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
		message: `Arrival station #${ctx.arrivalStationId} does not exist`,
	}),
	orders_delivery_location_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PICKUP_LOCATION_TYPE_NOT_FOUND,
		message: `Delivery location type #${ctx.deliveryLocationTypeId} does not exist`,
	}),
	orders_pickup_port_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
		message: `Pickup port #${ctx.pickupPortId} does not exist`,
	}),
	orders_pickup_berth_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.BERTH_NOT_FOUND,
		message: `Pickup berth #${ctx.pickupBerthId} does not exist`,
	}),
	orders_pickup_siding_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.SIDING_NOT_FOUND,
		message: `Pickup siding #${ctx.pickupSidingId} does not exist`,
	}),
	orders_delivery_port_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
		message: `Delivery port #${ctx.deliveryPortId} does not exist`,
	}),
	orders_delivery_berth_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.BERTH_NOT_FOUND,
		message: `Delivery berth #${ctx.deliveryBerthId} does not exist`,
	}),
	orders_delivery_siding_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.SIDING_NOT_FOUND,
		message: `Delivery siding #${ctx.deliverySidingId} does not exist`,
	}),
	order_attributes_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_attributes_attribute_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ATTRIBUTE_NOT_FOUND,
		message: `Attribute #${ctx.attributeId} does not exist`,
	}),
	order_status_history_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_status_history_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_STATUS_NOT_FOUND,
		message: `Order status #${ctx.statusId} does not exist`,
	}),
	order_status_history_changed_by_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.changedById} does not exist`,
	}),
	order_status_history_rejection_reason_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.REJECTION_REASON_NOT_FOUND,
		message: `Rejection reason #${ctx.rejectionReasonId} does not exist`,
	}),
	order_accessory_operations_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_accessory_operations_operation_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ACCESSORY_OPERATION_NOT_FOUND,
		message: `Accessory operation #${ctx.operationId} does not exist`,
	}),
	forecast_programs_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	forecast_programs_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
		message: `Program status #${ctx.statusId} does not exist`,
	}),
	forecast_programs_created_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.createdBy} does not exist`,
	}),
	forecast_programs_realized_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.realizedBy} does not exist`,
	}),
	forecast_program_history_program_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
		message: `Forecast program #${ctx.programId} does not exist`,
	}),
	forecast_program_history_changed_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.changedBy} does not exist`,
	}),
	forecast_program_history_old_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
		message: `Program status #${ctx.oldStatusId} does not exist`,
	}),
	forecast_program_history_new_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
		message: `Program status #${ctx.newStatusId} does not exist`,
	}),
	order_executions_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_executions_executed_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.executedBy} does not exist`,
	}),
	order_files_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_files_uploaded_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.uploadedBy} does not exist`,
	}),
	order_shares_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_shares_agency_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
		message: `Agency #${ctx.agencyId} does not exist`,
	}),
	order_shares_shared_by_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.sharedByUserId} does not exist`,
	}),
	order_date_modifications_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_date_modifications_modified_by_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.modifiedById} does not exist`,
	}),
	claims_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Customer #${ctx.customerId} does not exist`,
	}),
	claims_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	claims_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	claims_operation_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ACCESSORY_OPERATION_NOT_FOUND,
		message: `Accessory operation #${ctx.operationId} does not exist`,
	}),
	claims_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_TYPE_NOT_FOUND,
		message: `Claim type #${ctx.typeId} does not exist`,
	}),
	claims_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_STATUS_NOT_FOUND,
		message: `Claim status #${ctx.statusId} does not exist`,
	}),
	claims_closed_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.closedBy} does not exist`,
	}),
	claim_files_claim_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
		message: `Claim #${ctx.claimId} does not exist`,
	}),
	claim_files_uploaded_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.uploadedBy} does not exist`,
	}),
	claim_status_history_claim_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
		message: `Claim #${ctx.claimId} does not exist`,
	}),
	claim_status_history_status_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_STATUS_NOT_FOUND,
		message: `Claim status #${ctx.statusId} does not exist`,
	}),
	claim_status_history_changed_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.changedBy} does not exist`,
	}),
	claim_comments_claim_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
		message: `Claim #${ctx.claimId} does not exist`,
	}),
	claim_comments_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	train_wagons_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	train_wagons_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	order_wagons_order_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
		message: `Order #${ctx.orderId} does not exist`,
	}),
	order_wagons_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	order_wagons_forecast_program_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
		message: `Forecast program #${ctx.forecastProgramId} does not exist`,
	}),
	order_wagons_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	wagon_tracking_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	train_tracking_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	wagon_current_status_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	train_current_status_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	station_passages_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	station_passages_station_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
		message: `Station #${ctx.stationId} does not exist`,
	}),
	program_convoi_forecast_program_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
		message: `Forecast program #${ctx.forecastProgramId} does not exist`,
	}),
	program_convoi_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	notifications_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	notifications_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.NOTIFICATION_TYPE_NOT_FOUND,
		message: `Notification type #${ctx.typeId} does not exist`,
	}),
	notifications_channel_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.NOTIFICATION_CHANNEL_NOT_FOUND,
		message: `Notification channel #${ctx.channelId} does not exist`,
	}),
	password_reset_tokens_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	dtm_integration_log_request_type_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.DTM_REQUEST_TYPE_NOT_FOUND,
		message: `DTM request type #${ctx.requestTypeId} does not exist`,
	}),
	dtm_integration_log_created_by_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.createdBy} does not exist`,
	}),
	wagon_tracking_archive_wagon_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
		message: `Wagon #${ctx.wagonId} does not exist`,
	}),
	train_tracking_archive_train_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
		message: `Train #${ctx.trainId} does not exist`,
	}),
	archival_execution_log_triggered_by_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.triggeredByUserId} does not exist`,
	}),
	loading_locations_port_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
		message: `Port #${ctx.portId} does not exist`,
	}),
	role_permissions_role_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ROLE_NOT_FOUND,
		message: `Role #${ctx.roleId} does not exist`,
	}),
	role_permissions_permission_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PERMISSION_NOT_FOUND,
		message: `Permission #${ctx.permissionId} does not exist`,
	}),
	user_customers_user_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
		message: `User #${ctx.userId} does not exist`,
	}),
	user_customers_customer_id_fkey: (ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
		message: `Customer #${ctx.customerId} does not exist`,
	}),
};
