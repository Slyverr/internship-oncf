import { NotificationChannel, NotificationType } from "./notification.enum";

export const NOTIFICATION_TYPES: Record<
	NotificationType,
	{ id: number; name: NotificationType; description: string }
> = {
	[NotificationType.PROGRAM_PREVISIONNEL]: {
		id: 1,
		name: NotificationType.PROGRAM_PREVISIONNEL,
		description: "Program previsionnel notification",
	},
	[NotificationType.ORDER_STATUS_CHANGE]: {
		id: 2,
		name: NotificationType.ORDER_STATUS_CHANGE,
		description: "Order status change notification",
	},
	[NotificationType.ORDER_APPROVED]: {
		id: 3,
		name: NotificationType.ORDER_APPROVED,
		description: "Order approved notification",
	},
	[NotificationType.ORDER_REJECTED]: {
		id: 4,
		name: NotificationType.ORDER_REJECTED,
		description: "Order rejected notification",
	},
	[NotificationType.ORDER_ASSIGNED]: {
		id: 5,
		name: NotificationType.ORDER_ASSIGNED,
		description: "Order assigned notification",
	},
	[NotificationType.EXECUTION_COMPLETED]: {
		id: 6,
		name: NotificationType.EXECUTION_COMPLETED,
		description: "Execution completed notification",
	},
	[NotificationType.DTM_RESPONSE]: {
		id: 7,
		name: NotificationType.DTM_RESPONSE,
		description: "DTM response notification",
	},
	[NotificationType.MATERIAL_AVAILABLE]: {
		id: 8,
		name: NotificationType.MATERIAL_AVAILABLE,
		description: "Material available notification",
	},
	[NotificationType.CLAIM_CREATED]: {
		id: 9,
		name: NotificationType.CLAIM_CREATED,
		description: "Claim created notification",
	},
	[NotificationType.CLAIM_UPDATED]: {
		id: 10,
		name: NotificationType.CLAIM_UPDATED,
		description: "Claim updated notification",
	},
	[NotificationType.ORDER_CREATED]: {
		id: 11,
		name: NotificationType.ORDER_CREATED,
		description: "Order created notification",
	},
	[NotificationType.ORDER_MODIFIED]: {
		id: 12,
		name: NotificationType.ORDER_MODIFIED,
		description: "Order modified notification",
	},
	[NotificationType.SUB_ORDER_CREATED]: {
		id: 13,
		name: NotificationType.SUB_ORDER_CREATED,
		description: "Sub order created notification",
	},
};

export const NOTIFICATION_CHANNELS: Record<
	NotificationChannel,
	{ id: number; name: NotificationChannel }
> = {
	[NotificationChannel.EMAIL]: { id: 1, name: NotificationChannel.EMAIL },
	[NotificationChannel.SMS]: { id: 2, name: NotificationChannel.SMS },
	[NotificationChannel.IN_APP]: { id: 3, name: NotificationChannel.IN_APP },
	[NotificationChannel.PUSH]: { id: 4, name: NotificationChannel.PUSH },
};
