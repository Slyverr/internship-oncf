import { HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "../codes";
import { ConstraintHandler } from "../types";

export const compositeHandlers: Record<string, ConstraintHandler> = {
	order_attributes_order_id_attribute_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_ATTRIBUTE,
		message: `Order #${ctx.orderId} already has a value for attribute #${ctx.attributeId}`,
	}),
	parametrization_goods_type_id_attribute_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PARAMETRIZATION,
		message: `Goods type #${ctx.goodsTypeId} is already parametrized with attribute #${ctx.attributeId}`,
	}),
	customer_parametrization_customer_code_type_port_name_termi_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_CUSTOMER_PARAMETRIZATION,
		message: `Customer "${ctx.customerCode}" already has this parametrization configuration`,
	}),
	order_shares_order_id_agency_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_ORDER_SHARE,
		message: `Order #${ctx.orderId} is already shared with agency #${ctx.agencyId}`,
	}),
	program_convoi_forecast_program_id_train_id_key: (ctx) => ({
		statusCode: HttpStatus.CONFLICT,
		code: ConstraintCode.DUPLICATE_PROGRAM_CONVOI,
		message: `Forecast program #${ctx.forecastProgramId} is already linked to train #${ctx.trainId}`,
	}),
};
