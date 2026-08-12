import { DtmRequestType } from "@ecommand/shared";

export const DTM_REQUEST_TYPES: Record<
	DtmRequestType,
	{ id: number; name: DtmRequestType; description: string }
> = {
	[DtmRequestType.SEND_PROGRAM]: {
		id: 1,
		name: DtmRequestType.SEND_PROGRAM,
		description: "Submit program to DTM",
	},
	[DtmRequestType.GET_AVAILABILITY]: {
		id: 2,
		name: DtmRequestType.GET_AVAILABILITY,
		description: "Query DTM for availability",
	},
	[DtmRequestType.SEND_ORDER]: {
		id: 3,
		name: DtmRequestType.SEND_ORDER,
		description: "Submit order to DTM",
	},
	[DtmRequestType.GET_TRACKING]: {
		id: 4,
		name: DtmRequestType.GET_TRACKING,
		description: "Retrieve tracking information from DTM",
	},
	[DtmRequestType.UPDATE_STATUS]: {
		id: 5,
		name: DtmRequestType.UPDATE_STATUS,
		description: "Update status in DTM",
	},
	[DtmRequestType.GET_TRAINS]: {
		id: 6,
		name: DtmRequestType.GET_TRAINS,
		description: "Retrieve train list from DTM",
	},
	[DtmRequestType.GET_WAGONS]: {
		id: 7,
		name: DtmRequestType.GET_WAGONS,
		description: "Retrieve wagon list from DTM",
	},
	[DtmRequestType.SYNC_DATA]: {
		id: 8,
		name: DtmRequestType.SYNC_DATA,
		description: "Synchronize data with DTM",
	},
};
