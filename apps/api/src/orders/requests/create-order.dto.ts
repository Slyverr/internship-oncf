import { OrderStatus } from "@ecommand/shared";
import { Transform, Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumberString,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class CreateOrderDto {
	@IsInt()
	@Type(() => Number)
	goodsId: number;

	@IsInt()
	@Type(() => Number)
	customerId: number;

	@IsOptional()
	@Transform(({ value }) => value?.toUpperCase())
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	supervisor?: string;

	@IsOptional()
	@IsUUID()
	movementTypeId?: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	parentOrderId?: number;

	@IsNumberString()
	@IsNotEmpty()
	quantityDemanded: string;

	@IsOptional()
	@IsNumberString()
	quantityAchieved?: string;

	@IsUUID()
	unitId: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	departureStationId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	debtorCustomerId?: number;

	@IsOptional()
	@IsUUID()
	pickupLocationTypeId?: string;

	@IsOptional()
	@IsUUID()
	dispatchTypeId?: string;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	destinationCustomerId?: number;

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	arrivalStationId?: number;

	@IsOptional()
	@IsUUID()
	deliveryLocationTypeId?: string;

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
