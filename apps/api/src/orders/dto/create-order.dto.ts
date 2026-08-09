import { Transform, Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";
import { OrderStatus } from "src/db/reference-data";

export class CreateOrderDto {
	@IsInt()
	@Type(() => Number)
	goodsId: number;

	@IsInt()
	@Type(() => Number)
	customerId: number;

	@IsInt()
	@IsOptional()
	@Type(() => Number)
	userId?: number;

	@IsOptional()
	@Transform(({ value }) => value?.toUpperCase())
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	supervisor?: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	movementTypeId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	parentOrderId?: number;

	@IsString()
	quantityDemanded: string;

	@IsOptional()
	@IsString()
	quantityAchieved?: string;

	@IsInt()
	@Type(() => Number)
	unitId: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	departureStationId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	debtorCustomerId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	pickupLocationTypeId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	dispatchTypeId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	destinationCustomerId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	arrivalStationId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	deliveryLocationTypeId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	pickupPortId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	pickupBerthId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	pickupSidingId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	deliveryPortId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	deliveryBerthId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	deliverySidingId?: number;

	@IsOptional()
	@IsString()
	remarks?: string;

	@IsOptional()
	@IsDateString()
	orderDate?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;
}
