import { OrderStatus } from "@ecommand/shared";

export class UpdateOrderResponseDto {
	id: number;
	orderNumber: string;
	goodsId: number;
	customerId: number;
	userId: number;
	statusId: number;
	status: OrderStatus;
	supervisor?: string;
	movementTypeId?: number;
	parentOrderId?: number;
	quantityDemanded: string;
	quantityAchieved?: string;
	unitId: number;
	departureStationId?: number;
	debtorCustomerId?: number;
	pickupLocationTypeId?: number;
	dispatchTypeId?: number;
	destinationCustomerId?: number;
	arrivalStationId?: number;
	deliveryLocationTypeId?: number;
	pickupPortId?: number;
	pickupBerthId?: number;
	pickupSidingId?: number;
	deliveryPortId?: number;
	deliveryBerthId?: number;
	deliverySidingId?: number;
	remarks?: string;
	orderDate?: string;
	startDate?: string;
	endDate?: string;
	createdAt: string;
	updatedAt: string;
}
