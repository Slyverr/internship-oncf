import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const compositeHandlers: Record<string, ConstraintHandler> = {
	order_attributes_order_id_attribute_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_ATTRIBUTE,
	}),
	parametrization_goods_type_id_attribute_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PARAMETRIZATION,
	}),
	customer_parametrization_customer_code_type_port_name_termi_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_PARAMETRIZATION,
	}),
	order_shares_order_id_agency_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_SHARE,
	}),
	program_convoi_forecast_program_id_train_id_key: (_ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_CONVOI,
	}),
};
