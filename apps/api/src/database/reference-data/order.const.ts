import {
	DispatchType,
	MovementType,
	OrderStatus,
	PickupLocationType,
	ProgramStatus,
} from "@ecommand/shared";

export const ORDER_STATUSES: Record<
	OrderStatus,
	{ id: number; name: OrderStatus }
> = {
	[OrderStatus.DRAFT]: {
		id: 1,
		name: OrderStatus.DRAFT,
	},
	[OrderStatus.SUBMITTED]: {
		id: 2,
		name: OrderStatus.SUBMITTED,
	},
	[OrderStatus.APPROVED]: {
		id: 3,
		name: OrderStatus.APPROVED,
	},
	[OrderStatus.REJECTED]: {
		id: 4,
		name: OrderStatus.REJECTED,
	},
	[OrderStatus.IN_PROGRESS]: {
		id: 5,
		name: OrderStatus.IN_PROGRESS,
	},
	[OrderStatus.PARTIALLY_EXECUTED]: {
		id: 6,
		name: OrderStatus.PARTIALLY_EXECUTED,
	},
	[OrderStatus.COMPLETED]: {
		id: 7,
		name: OrderStatus.COMPLETED,
	},
	[OrderStatus.CANCELLED]: {
		id: 8,
		name: OrderStatus.CANCELLED,
	},
	[OrderStatus.SENT_TO_DTM]: {
		id: 9,
		name: OrderStatus.SENT_TO_DTM,
	},
};

export const PROGRAM_STATUSES: Record<
	ProgramStatus,
	{ id: number; name: ProgramStatus; description: string }
> = {
	[ProgramStatus.DRAFT]: {
		id: 1,
		name: ProgramStatus.DRAFT,
		description: "Initial draft state, not yet submitted",
	},
	[ProgramStatus.PENDING_APPROVAL]: {
		id: 2,
		name: ProgramStatus.PENDING_APPROVAL,
		description: "Awaiting review and approval",
	},
	[ProgramStatus.APPROVED]: {
		id: 3,
		name: ProgramStatus.APPROVED,
		description: "Approved and ready for implementation",
	},
	[ProgramStatus.SENT_TO_DTM]: {
		id: 4,
		name: ProgramStatus.SENT_TO_DTM,
		description: "Transmitted to DTM (Document Tracking Module)",
	},
	[ProgramStatus.CONFIRMED]: {
		id: 5,
		name: ProgramStatus.CONFIRMED,
		description: "Confirmed by all stakeholders",
	},
	[ProgramStatus.IN_PROGRESS]: {
		id: 6,
		name: ProgramStatus.IN_PROGRESS,
		description: "Currently being executed",
	},
	[ProgramStatus.COMPLETED]: {
		id: 7,
		name: ProgramStatus.COMPLETED,
		description: "Successfully completed and finalized",
	},
	[ProgramStatus.CANCELLED]: {
		id: 8,
		name: ProgramStatus.CANCELLED,
		description: "Cancelled before or during execution",
	},
};

export const MOVEMENT_TYPES: Record<
	MovementType,
	{ id: number; name: MovementType; description: string }
> = {
	[MovementType.IMPORT]: {
		id: 1,
		name: MovementType.IMPORT,
		description: "Inbound movement of goods into the country",
	},
	[MovementType.EXPORT]: {
		id: 2,
		name: MovementType.EXPORT,
		description: "Outbound movement of goods out of the country",
	},
	[MovementType.EMPTY]: {
		id: 3,
		name: MovementType.EMPTY,
		description: "Empty container or vehicle movement",
	},
	[MovementType.FULL_TRAIN]: {
		id: 4,
		name: MovementType.FULL_TRAIN,
		description: "Full train load movement",
	},
};

export const PICKUP_LOCATION_TYPES: Record<
	PickupLocationType,
	{ id: number; name: PickupLocationType; description: string }
> = {
	[PickupLocationType.SIDING]: {
		id: 1,
		name: PickupLocationType.SIDING,
		description: "Railway siding or spur for loading/unloading",
	},
	[PickupLocationType.DOMICILE]: {
		id: 2,
		name: PickupLocationType.DOMICILE,
		description: "Customer's physical address or warehouse location",
	},
};

export const DISPATCH_TYPES: Record<
	DispatchType,
	{ id: number; name: DispatchType; description: string }
> = {
	[DispatchType.PORT_DUE]: {
		id: 1,
		name: DispatchType.PORT_DUE,
		description: "Port fees due at destination port",
	},
	[DispatchType.PORT_PAID]: {
		id: 2,
		name: DispatchType.PORT_PAID,
		description: "Port fees already paid at origin port",
	},
};
