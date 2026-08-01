import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateOrderDto {
	@IsOptional()
	@IsInt()
	goodsId?: number;

	@IsOptional()
	@IsInt()
	customerId?: number;

	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@IsInt()
	statusId?: number;

	@IsOptional()
	@IsString()
	supervisor?: string;

	@IsOptional()
	@IsString()
	orderNumber?: string;

	@IsOptional()
	@IsInt()
	movementTypeId?: number;

	@IsOptional()
	@IsInt()
	parentOrderId?: number;

	@IsOptional()
	@IsString()
	quantityDemanded?: string;

	@IsOptional()
	@IsString()
	quantityAchieved?: string;

	@IsOptional()
	@IsInt()
	unitId?: number;

	@IsOptional()
	@IsInt()
	departureStationId?: number;

	@IsOptional()
	@IsInt()
	debtorCustomerId?: number;

	@IsOptional()
	@IsInt()
	pickupLocationTypeId?: number;

	@IsOptional()
	@IsInt()
	dispatchTypeId?: number;

	@IsOptional()
	@IsInt()
	destinationCustomerId?: number;

	@IsOptional()
	@IsInt()
	arrivalStationId?: number;

	@IsOptional()
	@IsInt()
	deliveryLocationTypeId?: number;

	@IsOptional()
	@IsInt()
	pickupPortId?: number;

	@IsOptional()
	@IsInt()
	pickupBerthId?: number;

	@IsOptional()
	@IsInt()
	pickupSidingId?: number;

	@IsOptional()
	@IsInt()
	deliveryPortId?: number;

	@IsOptional()
	@IsInt()
	deliveryBerthId?: number;

	@IsOptional()
	@IsInt()
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
