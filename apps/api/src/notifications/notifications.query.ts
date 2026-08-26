import { notifications } from "drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { NotificationId, NotificationInsert } from "./notifications.types";

type NotificationsColumns = QueryColumns<"notifications">;
type NotificationsRelations = QueryRelations<"notifications">;

const notificationListColumns = {
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

const notificationListRelations = {
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

const notificationDetailColumns = {
	...notificationListColumns,
	errorMessage: true,
} satisfies NotificationsColumns;

const notificationDetailRelations = {
	...notificationListRelations,
	recipientUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
} satisfies NotificationsRelations;

export async function createNotification(
	db: DrizzleDb,
	values: NotificationInsert,
) {
	const [created] = await withDbErrorHandling(
		() =>
			db.insert(notifications).values(values).returning({
				id: notifications.id,
			}),
		values,
	);

	return created;
}

export async function findNotifications(db: DrizzleDb, userId: number) {
	return db.query.notifications.findMany({
		where: {
			recipientUserId: userId,
		},
		columns: notificationListColumns,
		with: notificationListRelations,
		orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
	});
}

export async function findNotification(db: DrizzleDb, id: NotificationId) {
	return db.query.notifications.findFirst({
		where: { id },
		columns: notificationDetailColumns,
		with: notificationDetailRelations,
	});
}

export async function findNotificationForOwnership(
	db: DrizzleDb,
	id: NotificationId,
) {
	return db.query.notifications.findFirst({
		where: { id },
		columns: {
			recipientUserId: true,
		},
	});
}

export async function findUnreadCount(db: DrizzleDb, userId: number) {
	const result = await db
		.select({
			count: sql<number>`count(*)`,
		})
		.from(notifications)
		.where(
			and(
				eq(notifications.recipientUserId, userId),
				isNull(notifications.readAt),
				eq(notifications.status, "SENT"),
			),
		);

	return result[0]?.count ?? 0;
}

export async function updateNotificationRead(
	db: DrizzleDb,
	id: NotificationId,
	userId: number,
) {
	const [updated] = await withDbErrorHandling(
		() =>
			db
				.update(notifications)
				.set({
					readAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(notifications.id, id),
						eq(notifications.recipientUserId, userId),
					),
				)
				.returning({
					id: notifications.id,
				}),
		{
			id,
			userId,
		},
	);

	return updated;
}

export async function updateAllNotificationsRead(
	db: DrizzleDb,
	userId: number,
) {
	return db
		.update(notifications)
		.set({
			readAt: new Date().toISOString(),
		})
		.where(
			and(
				eq(notifications.recipientUserId, userId),
				isNull(notifications.readAt),
				eq(notifications.status, "SENT"),
			),
		)
		.returning({
			id: notifications.id,
		});
}

export async function markNotificationAsSent(
	db: DrizzleDb,
	id: NotificationId,
) {
	const [updated] = await withDbErrorHandling(
		() =>
			db
				.update(notifications)
				.set({
					status: "SENT",
					sentAt: new Date().toISOString(),
				})
				.where(eq(notifications.id, id))
				.returning({
					id: notifications.id,
				}),
		{ id },
	);

	return updated;
}

export async function markNotificationAsFailed(
	db: DrizzleDb,
	id: NotificationId,
	error: string,
) {
	const [updated] = await withDbErrorHandling(
		() =>
			db
				.update(notifications)
				.set({
					status: "FAILED",
					errorMessage: error,
					retryCount: sql`${notifications.retryCount} + 1`,
				})
				.where(eq(notifications.id, id))
				.returning({
					id: notifications.id,
				}),
		{
			id,
			error,
		},
	);

	return updated;
}
