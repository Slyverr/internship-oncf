import {
	DispatchType,
	MovementType,
	OrderStatus,
	PickupLocationType,
	ProgramStatus,
} from "@ecommand/shared";
import {
	createEnumReferenceMap,
	createReferenceMap,
} from "./reference-data.utils";

export const ORDER_STATUSES = createEnumReferenceMap(
	"order_statuses",
	OrderStatus,
);

export const PROGRAM_STATUSES = createReferenceMap("program_statuses", {
	[ProgramStatus.DRAFT]: "Initial draft state, not yet submitted",
	[ProgramStatus.PENDING_APPROVAL]: "Awaiting review and approval",
	[ProgramStatus.APPROVED]: "Approved and ready for implementation",
	[ProgramStatus.SENT_TO_DTM]: "Transmitted to DTM (Document Tracking Module)",
	[ProgramStatus.CONFIRMED]: "Confirmed by all stakeholders",
	[ProgramStatus.IN_PROGRESS]: "Currently being executed",
	[ProgramStatus.COMPLETED]: "Successfully completed and finalized",
	[ProgramStatus.CANCELLED]: "Cancelled before or during execution",
});

export const MOVEMENT_TYPES = createReferenceMap("movement_types", {
	[MovementType.IMPORT]: "Inbound movement of goods into the country",
	[MovementType.EXPORT]: "Outbound movement of goods out of the country",
	[MovementType.EMPTY]: "Empty container or vehicle movement",
	[MovementType.FULL_TRAIN]: "Full train load movement",
});

export const PICKUP_LOCATION_TYPES = createReferenceMap(
	"pickup_location_types",
	{
		[PickupLocationType.SIDING]: "Railway siding or spur for loading/unloading",
		[PickupLocationType.DOMICILE]:
			"Customer's physical address or warehouse location",
	},
);

export const DISPATCH_TYPES = createReferenceMap("dispatch_types", {
	[DispatchType.PORT_DUE]: "Port fees due at destination port",
	[DispatchType.PORT_PAID]: "Port fees already paid at origin port",
});
