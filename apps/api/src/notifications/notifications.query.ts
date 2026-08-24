import { QueryColumns, QueryRelations } from "src/db/drizzle.types";

type NotificationsColumns = QueryColumns<"notifications">;
type NotificationsRelations = QueryRelations<"notifications">;

export const notificationListColumns = {
	id: true,
	recipientUserId: true,
	typeId: true,
	channelId: true,
	title: true,
	message: true,
	status: true,
	readAt: true,
	sentAt: true,
	relatedEntityType: true,
	relatedEntityId: true,
	retryCount: true,
	createdAt: true,
} satisfies NotificationsColumns;

export const notificationListRelations = {
	notificationType: {
		columns: {
			id: true,
			name: true,
		},
	},

	notificationChannel: {
		columns: {
			id: true,
			name: true,
		},
	},
} satisfies NotificationsRelations;

export const notificationDetailColumns = {
	...notificationListColumns,
	errorMessage: true,
} satisfies NotificationsColumns;

export const notificationDetailRelations = {
	...notificationListRelations,

	recipientUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
} satisfies NotificationsRelations;
