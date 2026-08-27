import { NotificationChannel, NotificationType } from "@ecommand/shared";
import { createEnumReferenceMap } from "./reference-data.utils";

export const NOTIFICATION_TYPES = createEnumReferenceMap(
	"notification_types",
	NotificationType,
);

export const NOTIFICATION_CHANNELS = createEnumReferenceMap(
	"notification_channels",
	NotificationChannel,
);
