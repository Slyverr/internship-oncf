import {
	DispatchType,
	MovementType,
	OrderStatus,
	PickupLocationType,
	ProgramStatus,
} from "@ecommand/shared";
import {
	createReferenceMap,
	defaultReferenceMapper,
	enumReferenceMapper,
} from "../reference-data.utils";

export const ORDER_STATUSES_SCOPE = "order_statuses";
export const PROGRAM_STATUSES_SCOPE = "program_statuses";
export const MOVEMENT_TYPES_SCOPE = "movement_types";
export const PICKUP_LOCATION_TYPES_SCOPE = "pickup_location_types";
export const DISPATCH_TYPES_SCOPE = "dispatch_types";

export const ORDER_STATUSES = createReferenceMap(
	OrderStatus,
	enumReferenceMapper(ORDER_STATUSES_SCOPE),
);

export const PROGRAM_STATUSES = createReferenceMap(
	{
		[ProgramStatus.DRAFT]: "Initial draft state, not yet submitted",
		[ProgramStatus.PENDING_APPROVAL]: "Awaiting review and approval",
		[ProgramStatus.APPROVED]: "Approved and ready for implementation",
		[ProgramStatus.SENT_TO_DTM]:
			"Transmitted to DTM (Document Tracking Module)",
		[ProgramStatus.CONFIRMED]: "Confirmed by all stakeholders",
		[ProgramStatus.IN_PROGRESS]: "Currently being executed",
		[ProgramStatus.COMPLETED]: "Successfully completed and finalized",
		[ProgramStatus.CANCELLED]: "Cancelled before or during execution",
	},
	defaultReferenceMapper(PROGRAM_STATUSES_SCOPE),
);

export const MOVEMENT_TYPES = createReferenceMap(
	{
		[MovementType.IMPORT]: "Inbound movement of goods into the country",
		[MovementType.EXPORT]: "Outbound movement of goods out of the country",
		[MovementType.EMPTY]: "Empty container or vehicle movement",
		[MovementType.FULL_TRAIN]: "Full train load movement",
	},
	defaultReferenceMapper(MOVEMENT_TYPES_SCOPE),
);

export const PICKUP_LOCATION_TYPES = createReferenceMap(
	{
		[PickupLocationType.SIDING]: "Railway siding or spur for loading/unloading",
		[PickupLocationType.DOMICILE]:
			"Customer's physical address or warehouse location",
	},
	defaultReferenceMapper(PICKUP_LOCATION_TYPES_SCOPE),
);

export const DISPATCH_TYPES = createReferenceMap(
	{
		[DispatchType.PORT_DUE]: "Port fees due at destination port",
		[DispatchType.PORT_PAID]: "Port fees already paid at origin port",
	},
	defaultReferenceMapper(DISPATCH_TYPES_SCOPE),
);
