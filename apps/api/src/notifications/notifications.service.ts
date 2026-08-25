import { Injectable, NotFoundException } from "@nestjs/common";
import { notifications } from "drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import { toCreate } from "./notifications.mapper";
import {
	notificationDetailColumns,
	notificationDetailRelations,
	notificationListColumns,
	notificationListRelations,
} from "./notifications.query";
import type { NotificationId } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

@Injectable()
export class NotificationsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateNotificationDto) {
		const values = toCreate(dto);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(notifications)
					.values(values)
					.returning({ id: notifications.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		return this.drizzle.db.query.notifications.findMany({
			where: { recipientUserId: user.id },
			columns: notificationListColumns,
			with: notificationListRelations,
			orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
		});
	}

	async findOne(id: NotificationId) {
		const notification = await this.drizzle.db.query.notifications.findFirst({
			where: { id },
			columns: notificationDetailColumns,
			with: notificationDetailRelations,
		});

		return this.ensure(notification, id);
	}

	async findOneForOwnership(id: NotificationId) {
		const notification = await this.drizzle.db.query.notifications.findFirst({
			where: { id },
			columns: { recipientUserId: true },
		});

		return this.ensure(notification, id);
	}

	async getUnreadCount(userId: number) {
		const result = await this.drizzle.db
			.select({ count: sql<number>`count(*)` })
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

	async markAsRead(id: NotificationId, userId: number) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(notifications)
					.set({ readAt: new Date().toISOString() })
					.where(
						and(
							eq(notifications.id, id),
							eq(notifications.recipientUserId, userId),
						),
					)
					.returning({ id: notifications.id }),
			{ id, userId },
		);

		if (!updated) {
			throw new NotFoundException(`Notification ${id} not found`);
		}

		return this.findOne(id);
	}

	async markAllAsRead(userId: number) {
		const updated = await this.drizzle.db
			.update(notifications)
			.set({ readAt: new Date().toISOString() })
			.where(
				and(
					eq(notifications.recipientUserId, userId),
					isNull(notifications.readAt),
					eq(notifications.status, "SENT"),
				),
			)
			.returning({ id: notifications.id });

		return { count: updated.length };
	}

	async markAsSent(id: NotificationId) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(notifications)
					.set({
						status: "SENT",
						sentAt: new Date().toISOString(),
					})
					.where(eq(notifications.id, id))
					.returning({ id: notifications.id }),
			{ id },
		);

		return updated;
	}

	async markAsFailed(id: NotificationId, error: string) {
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
					.returning({ id: notifications.id }),
			{ id, error },
		);

		return updated;
	}

	private ensure<T>(notification: T | undefined, id: NotificationId) {
		if (!notification) {
			throw new NotFoundException(`Notification ${id} not found`);
		}

		return notification;
	}
}
