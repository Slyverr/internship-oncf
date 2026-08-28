import { NotificationChannel, NotificationType } from "@ecommand/shared";
import {
	createReferenceMap,
	enumReferenceMapper,
} from "./reference-data.utils";

export const NOTIFICATION_TYPES = createReferenceMap(
	NotificationType,
	enumReferenceMapper("notification_types"),
);

export const NOTIFICATION_CHANNELS = createReferenceMap(
	NotificationChannel,
	enumReferenceMapper("notification_channels"),
);
