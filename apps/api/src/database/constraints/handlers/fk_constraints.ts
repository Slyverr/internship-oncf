import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const fkHandlers: Record<string, ConstraintHandler> = {
	customers_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_TYPE_NOT_FOUND,
	}),
	centers_agency_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
	}),
	users_role_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ROLE_NOT_FOUND,
	}),
	users_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	users_agency_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
	}),
	user_sessions_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	user_activity_log_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	user_activity_log_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	user_activity_log_agency_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
	}),
	goods_goods_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_TYPE_NOT_FOUND,
	}),
	parametrization_goods_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_TYPE_NOT_FOUND,
	}),
	parametrization_attribute_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ATTRIBUTE_NOT_FOUND,
	}),
	ports_station_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
	}),
	berths_port_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
	}),
	orders_parent_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PARENT_ORDER_NOT_FOUND,
	}),
	orders_unit_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.UNIT_NOT_FOUND,
	}),
	orders_goods_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.GOODS_NOT_FOUND,
	}),
	orders_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	orders_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	orders_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_STATUS_NOT_FOUND,
	}),
	orders_movement_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.MOVEMENT_TYPE_NOT_FOUND,
	}),
	orders_departure_station_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
	}),
	orders_debtor_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	orders_pickup_location_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PICKUP_LOCATION_TYPE_NOT_FOUND,
	}),
	orders_dispatch_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.DISPATCH_TYPE_NOT_FOUND,
	}),
	orders_destination_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	orders_arrival_station_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
	}),
	orders_delivery_location_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PICKUP_LOCATION_TYPE_NOT_FOUND,
	}),
	orders_pickup_port_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
	}),
	orders_pickup_berth_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.BERTH_NOT_FOUND,
	}),
	orders_pickup_siding_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.SIDING_NOT_FOUND,
	}),
	orders_delivery_port_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
	}),
	orders_delivery_berth_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.BERTH_NOT_FOUND,
	}),
	orders_delivery_siding_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.SIDING_NOT_FOUND,
	}),
	order_attributes_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_attributes_attribute_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ATTRIBUTE_NOT_FOUND,
	}),
	order_status_history_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_status_history_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_STATUS_NOT_FOUND,
	}),
	order_status_history_changed_by_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	order_status_history_rejection_reason_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.REJECTION_REASON_NOT_FOUND,
	}),
	order_accessory_operations_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_accessory_operations_operation_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ACCESSORY_OPERATION_NOT_FOUND,
	}),
	forecast_programs_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	forecast_programs_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
	}),
	forecast_programs_created_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	forecast_programs_realized_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	forecast_program_history_program_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
	}),
	forecast_program_history_changed_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	forecast_program_history_old_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
	}),
	forecast_program_history_new_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PROGRAM_STATUS_NOT_FOUND,
	}),
	order_executions_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_executions_executed_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	order_files_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_files_uploaded_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	order_shares_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_shares_agency_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.AGENCY_NOT_FOUND,
	}),
	order_shares_shared_by_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	order_date_modifications_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_date_modifications_modified_by_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	claims_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
	claims_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	claims_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	claims_operation_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ACCESSORY_OPERATION_NOT_FOUND,
	}),
	claims_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_TYPE_NOT_FOUND,
	}),
	claims_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_STATUS_NOT_FOUND,
	}),
	claims_closed_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	claim_files_claim_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
	}),
	claim_files_uploaded_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	claim_status_history_claim_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
	}),
	claim_status_history_status_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_STATUS_NOT_FOUND,
	}),
	claim_status_history_changed_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	claim_comments_claim_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CLAIM_NOT_FOUND,
	}),
	claim_comments_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	train_wagons_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	train_wagons_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	order_wagons_order_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ORDER_NOT_FOUND,
	}),
	order_wagons_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	order_wagons_forecast_program_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
	}),
	order_wagons_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	wagon_tracking_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	train_tracking_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	wagon_current_status_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	train_current_status_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	station_passages_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	station_passages_station_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.STATION_NOT_FOUND,
	}),
	program_convoi_forecast_program_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.FORECAST_PROGRAM_NOT_FOUND,
	}),
	program_convoi_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	notifications_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	notifications_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.NOTIFICATION_TYPE_NOT_FOUND,
	}),
	notifications_channel_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.NOTIFICATION_CHANNEL_NOT_FOUND,
	}),
	password_reset_tokens_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	dtm_integration_log_request_type_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.DTM_REQUEST_TYPE_NOT_FOUND,
	}),
	dtm_integration_log_created_by_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	wagon_tracking_archive_wagon_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.WAGON_NOT_FOUND,
	}),
	train_tracking_archive_train_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.TRAIN_NOT_FOUND,
	}),
	archival_execution_log_triggered_by_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	loading_locations_port_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PORT_NOT_FOUND,
	}),
	role_permissions_role_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.ROLE_NOT_FOUND,
	}),
	role_permissions_permission_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.PERMISSION_NOT_FOUND,
	}),
	user_customers_user_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.USER_NOT_FOUND,
	}),
	user_customers_customer_id_fkey: (_ctx) => ({
		statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
		code: ConstraintCode.CUSTOMER_NOT_FOUND,
	}),
};
