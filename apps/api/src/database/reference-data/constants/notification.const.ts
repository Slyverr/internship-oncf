import { NotificationChannel, NotificationType } from "@ecommand/shared";
import {
	createReferenceMap,
	enumReferenceMapper,
} from "../reference-data.utils";

export const NOTIFICATION_TYPES_SCOPE = "notification_types";
export const NOTIFICATION_CHANNELS_SCOPE = "notification_channels";

export const NOTIFICATION_TYPES = createReferenceMap(
	NotificationType,
	enumReferenceMapper(NOTIFICATION_TYPES_SCOPE),
);

export const NOTIFICATION_CHANNELS = createReferenceMap(
	NotificationChannel,
	enumReferenceMapper(NOTIFICATION_CHANNELS_SCOPE),
);
