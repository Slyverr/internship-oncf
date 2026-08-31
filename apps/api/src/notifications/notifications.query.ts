import { Injectable } from "@nestjs/common";
import { notifications } from "drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
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

@Injectable()
export class NotificationsQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createNotification(values: NotificationInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(notifications).values(values).returning({
					id: notifications.id,
				}),
			values,
		);
		return created;
	}

	async findNotifications(userId: number) {
		return this.drizzle.db.query.notifications.findMany({
			where: {
				recipientUserId: userId,
			},
			columns: notificationListColumns,
			with: notificationListRelations,
			orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
		});
	}

	async findNotification(id: NotificationId) {
		return this.drizzle.db.query.notifications.findFirst({
			where: { id },
			columns: notificationDetailColumns,
			with: notificationDetailRelations,
		});
	}

	async findNotificationForOwnership(id: NotificationId) {
		return this.drizzle.db.query.notifications.findFirst({
			where: { id },
			columns: {
				recipientUserId: true,
			},
		});
	}

	async findUnreadCount(userId: number) {
		const result = await this.drizzle.db
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

	async updateNotificationRead(id: NotificationId, userId: number) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
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

	async updateAllNotificationsRead(userId: number) {
		return this.drizzle.db
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

	async markNotificationAsSent(id: NotificationId) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
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

	async markNotificationAsFailed(id: NotificationId, error: string) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
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
}
