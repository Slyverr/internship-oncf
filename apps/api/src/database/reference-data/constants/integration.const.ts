import { DtmRequestType } from "@ecommand/shared";
import {
	createReferenceMap,
	defaultReferenceMapper,
} from "../reference-data.utils";

export const DTM_REQUEST_TYPES_SCOPE = "dtm_request_types";

export const DTM_REQUEST_TYPES = createReferenceMap(
	{
		[DtmRequestType.SEND_PROGRAM]: "Submit program to DTM",
		[DtmRequestType.GET_AVAILABILITY]: "Query DTM for availability",
		[DtmRequestType.SEND_ORDER]: "Submit order to DTM",
		[DtmRequestType.GET_TRACKING]: "Retrieve tracking information from DTM",
		[DtmRequestType.UPDATE_STATUS]: "Update status in DTM",
		[DtmRequestType.GET_TRAINS]: "Retrieve train list from DTM",
		[DtmRequestType.GET_WAGONS]: "Retrieve wagon list from DTM",
		[DtmRequestType.SYNC_DATA]: "Synchronize data with DTM",
	},
	defaultReferenceMapper(DTM_REQUEST_TYPES_SCOPE),
);
