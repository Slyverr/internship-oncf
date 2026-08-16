export class OrderMutationResponseDto {
	id: number;
	orderNumber: string | null;

	goodsId: number;
	customerId: number;
	userId: number;
	statusId: number;

	supervisor?: string;
	movementTypeId?: number;
	parentOrderId?: number;

	quantityDemanded: string;
	quantityAchieved?: string;

	unitId: number;

	departureStationId?: number;
	arrivalStationId?: number;

	debtorCustomerId?: number;
	destinationCustomerId?: number;

	pickupLocationTypeId?: number;
	deliveryLocationTypeId?: number;

	dispatchTypeId?: number;

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
