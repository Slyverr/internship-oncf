import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const uniqueHandlers: Record<string, ConstraintHandler> = {
	customers_customer_code_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_CODE,
		message: `A customer with code "${ctx.customerCode}" already exists`,
	}),
	customer_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_TYPE_NAME,
		message: `A customer type with the name "${ctx.name}" already exists`,
	}),
	roles_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ROLE_NAME,
		message: `A role with the name "${ctx.name}" already exists`,
	}),
	permissions_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PERMISSION_NAME,
		message: `A permission with the name "${ctx.name}" already exists`,
	}),
	agencies_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_AGENCY_NAME,
		message: `An agency with the name "${ctx.name}" already exists`,
	}),
	users_email_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_USER_EMAIL,
		message: `A user with the email "${ctx.email}" already exists`,
	}),
	goods_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_GOODS_TYPE_NAME,
		message: `A goods type with the name "${ctx.name}" already exists`,
	}),
	goods_goods_code_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_GOODS_CODE,
		message: `Goods with code "${ctx.goodsCode}" already exists`,
	}),
	stations_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_STATION_NAME,
		message: `A station with the name "${ctx.name}" already exists`,
	}),
	stations_station_code_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_STATION_CODE,
		message: `A station with code "${ctx.stationCode}" already exists`,
	}),
	ports_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PORT_NAME,
		message: `A port with the name "${ctx.name}" already exists`,
	}),
	sidings_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SIDING_NAME,
		message: `A siding with the name "${ctx.name}" already exists`,
	}),
	attributes_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ATTRIBUTE_NAME,
		message: `An attribute with the name "${ctx.name}" already exists`,
	}),
	orders_order_number_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_NUMBER,
		message: `An order with number "${ctx.orderNumber}" already exists`,
	}),
	order_status_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_STATUS_NAME,
		message: `An order status with the name "${ctx.name}" already exists`,
	}),
	movement_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_MOVEMENT_TYPE_NAME,
		message: `A movement type with the name "${ctx.name}" already exists`,
	}),
	units_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_UNIT_NAME,
		message: `A unit with the name "${ctx.name}" already exists`,
	}),
	pickup_location_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PICKUP_LOCATION_TYPE_NAME,
		message: `A pickup location type with the name "${ctx.name}" already exists`,
	}),
	dispatch_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_DISPATCH_TYPE_NAME,
		message: `A dispatch type with the name "${ctx.name}" already exists`,
	}),
	program_status_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_STATUS_NAME,
		message: `A program status with the name "${ctx.name}" already exists`,
	}),
	forecast_programs_program_number_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_NUMBER,
		message: `A forecast program with number "${ctx.programNumber}" already exists`,
	}),
	accessory_operations_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ACCESSORY_OPERATION_NAME,
		message: `An accessory operation with the name "${ctx.name}" already exists`,
	}),
	rejection_reasons_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_REJECTION_REASON_NAME,
		message: `A rejection reason with the name "${ctx.name}" already exists`,
	}),
	shipping_companies_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SHIPPING_COMPANY_NAME,
		message: `A shipping company with the name "${ctx.name}" already exists`,
	}),
	vessels_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_VESSEL_NAME,
		message: `A vessel with the name "${ctx.name}" already exists`,
	}),
	importers_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_IMPORTER_NAME,
		message: `An importer with the name "${ctx.name}" already exists`,
	}),
	representatives_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_REPRESENTATIVE_NAME,
		message: `A representative with the name "${ctx.name}" already exists`,
	}),
	claim_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CLAIM_TYPE_NAME,
		message: `A claim type with the name "${ctx.name}" already exists`,
	}),
	claim_status_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CLAIM_STATUS_NAME,
		message: `A claim status with the name "${ctx.name}" already exists`,
	}),
	trains_external_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_TRAIN_EXTERNAL_ID,
		message: `A train with external ID "${ctx.externalId}" already exists`,
	}),
	trains_train_number_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_TRAIN_NUMBER,
		message: `A train with number "${ctx.trainNumber}" already exists`,
	}),
	wagons_external_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_WAGON_EXTERNAL_ID,
		message: `A wagon with external ID "${ctx.externalId}" already exists`,
	}),
	wagons_wagon_number_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_WAGON_NUMBER,
		message: `A wagon with number "${ctx.wagonNumber}" already exists`,
	}),
	notification_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_NOTIFICATION_TYPE_NAME,
		message: `A notification type with the name "${ctx.name}" already exists`,
	}),
	notification_channels_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_NOTIFICATION_CHANNEL_NAME,
		message: `A notification channel with the name "${ctx.name}" already exists`,
	}),
	dtm_request_types_name_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_DTM_REQUEST_TYPE_NAME,
		message: `A DTM request type with the name "${ctx.name}" already exists`,
	}),
	password_reset_tokens_token_key: (_) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PASSWORD_RESET_TOKEN,
		message: `This password reset token has already been used`,
	}),
	user_sessions_session_token_key: (_) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_SESSION_TOKEN,
		message: `Session token conflict`,
	}),
};
