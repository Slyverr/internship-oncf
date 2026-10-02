import { NotificationChannel } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { notifications } from "drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import { NOTIFICATION_CHANNELS } from "@/database/reference-data";
import type { NotificationId, NotificationInsert } from "./notifications.types";

type NotificationsColumns = QueryColumns<"notifications">;
type NotificationsRelations = QueryRelations<"notifications">;
type RelatedRecordReference = {
	relatedEntityType: string | null;
	relatedEntityId: number | null;
};

export type RelatedRecordCode = {
	relatedEntityType: "claims" | "orders" | "programs";
	relatedEntityId: number;
	recordCode: string;
};

const notificationListColumns = {
	id: true,
	recipientUserId: true,
	typeId: true,
	channelId: true,
	messageCode: true,
	messageParameters: true,
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
				channelId: NOTIFICATION_CHANNELS[NotificationChannel.IN_APP].id,
				status: "SENT",
			},
			columns: notificationListColumns,
			with: notificationListRelations,
			orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
		});
	}

	async findRelatedRecordCodes(
		references: RelatedRecordReference[],
	): Promise<RelatedRecordCode[]> {
		const idsByType = {
			claims: [
				...new Set(
					references
						.filter((item) => item.relatedEntityType === "claims")
						.map((item) => item.relatedEntityId)
						.filter((id): id is number => id !== null),
				),
			],
			orders: [
				...new Set(
					references
						.filter((item) => item.relatedEntityType === "orders")
						.map((item) => item.relatedEntityId)
						.filter((id): id is number => id !== null),
				),
			],
			programs: [
				...new Set(
					references
						.filter((item) => item.relatedEntityType === "programs")
						.map((item) => item.relatedEntityId)
						.filter((id): id is number => id !== null),
				),
			],
		};
		const [claims, orders, programs] = await Promise.all([
			idsByType.claims.length
				? this.drizzle.db.query.claims.findMany({
						where: { id: { in: idsByType.claims } },
						columns: { id: true, claimNumber: true },
					})
				: Promise.resolve([]),
			idsByType.orders.length
				? this.drizzle.db.query.orders.findMany({
						where: { id: { in: idsByType.orders } },
						columns: { id: true, orderNumber: true },
					})
				: Promise.resolve([]),
			idsByType.programs.length
				? this.drizzle.db.query.forecastPrograms.findMany({
						where: { id: { in: idsByType.programs } },
						columns: { id: true, programNumber: true },
					})
				: Promise.resolve([]),
		]);

		return [
			...claims.map(({ id, claimNumber }) => ({
				relatedEntityType: "claims" as const,
				relatedEntityId: id,
				recordCode: claimNumber,
			})),
			...orders.map(({ id, orderNumber }) => ({
				relatedEntityType: "orders" as const,
				relatedEntityId: id,
				recordCode: orderNumber,
			})),
			...programs.map(({ id, programNumber }) => ({
				relatedEntityType: "programs" as const,
				relatedEntityId: id,
				recordCode: programNumber,
			})),
		];
	}

	async findNotification(id: NotificationId) {
		return this.drizzle.db.query.notifications.findFirst({
			where: { id },
			columns: notificationListColumns,
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
					eq(
						notifications.channelId,
						NOTIFICATION_CHANNELS[NotificationChannel.IN_APP].id,
					),
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
					eq(
						notifications.channelId,
						NOTIFICATION_CHANNELS[NotificationChannel.IN_APP].id,
					),
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
