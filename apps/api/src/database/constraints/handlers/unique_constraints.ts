import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const uniqueHandlers: Record<string, ConstraintHandler> = {
	customers_customer_code_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_CODE,
	}),
	customer_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_TYPE_NAME,
	}),
	roles_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ROLE_NAME,
	}),
	permissions_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PERMISSION_NAME,
	}),
	agencies_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_AGENCY_NAME,
	}),
	users_email_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_USER_EMAIL,
	}),
	users_employee_code_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_USER_EMPLOYEE_CODE,
	}),
	goods_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_GOODS_TYPE_NAME,
	}),
	goods_goods_code_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_GOODS_CODE,
	}),
	stations_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_STATION_NAME,
	}),
	stations_station_code_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_STATION_CODE,
	}),
	ports_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PORT_NAME,
	}),
	sidings_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SIDING_NAME,
	}),
	attributes_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ATTRIBUTE_NAME,
	}),
	orders_order_number_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_NUMBER,
	}),
	order_status_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_STATUS_NAME,
	}),
	movement_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_MOVEMENT_TYPE_NAME,
	}),
	units_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_UNIT_NAME,
	}),
	pickup_location_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PICKUP_LOCATION_TYPE_NAME,
	}),
	dispatch_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_DISPATCH_TYPE_NAME,
	}),
	program_status_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_STATUS_NAME,
	}),
	forecast_programs_program_number_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_NUMBER,
	}),
	accessory_operations_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ACCESSORY_OPERATION_NAME,
	}),
	rejection_reasons_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_REJECTION_REASON_NAME,
	}),
	shipping_companies_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SHIPPING_COMPANY_NAME,
	}),
	vessels_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_VESSEL_NAME,
	}),
	importers_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_IMPORTER_NAME,
	}),
	representatives_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_REPRESENTATIVE_NAME,
	}),
	claim_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CLAIM_TYPE_NAME,
	}),
	claim_status_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CLAIM_STATUS_NAME,
	}),
	trains_external_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_TRAIN_EXTERNAL_ID,
	}),
	trains_train_number_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_TRAIN_NUMBER,
	}),
	wagons_external_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_WAGON_EXTERNAL_ID,
	}),
	wagons_wagon_number_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_WAGON_NUMBER,
	}),
	notification_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_NOTIFICATION_TYPE_NAME,
	}),
	notification_channels_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_NOTIFICATION_CHANNEL_NAME,
	}),
	dtm_request_types_name_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_DTM_REQUEST_TYPE_NAME,
	}),
	password_reset_tokens_token_key: (_) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PASSWORD_RESET_TOKEN,
	}),
	user_sessions_session_token_key: (_) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SESSION_TOKEN,
	}),
};
