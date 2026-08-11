import { Injectable, NotFoundException } from "@nestjs/common";
import { notifications } from "drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import {
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
} from "src/db/reference-data";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationId } from "./notifications.types";

@Injectable()
export class NotificationsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateNotificationDto) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(notifications)
					.values({
						userId: dto.userId,
						typeId: NOTIFICATION_TYPES[dto.type].id,
						channelId: NOTIFICATION_CHANNELS[dto.channel].id,
						title: dto.title,
						message: dto.message,
						relatedEntityType: dto.relatedEntityType,
						relatedEntityId: dto.relatedEntityId,
						status: "PENDING",
					})
					.returning(),
			dto,
		);
		return created;
	}

	async findAll(user: AuthUser) {
		return this.drizzle.db.query.notifications.findMany({
			where: { userId: user.id },
			orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
		});
	}

	async findOne(id: NotificationId) {
		const notification = await this.drizzle.db.query.notifications.findFirst({
			where: { id },
		});
		if (!notification)
			throw new NotFoundException(`Notification ${id} not found`);
		return notification;
	}

	async getUnreadCount(userId: number) {
		const result = await this.drizzle.db
			.select({ count: sql<number>`count(*)` })
			.from(notifications)
			.where(
				and(
					eq(notifications.userId, userId),
					isNull(notifications.readAt),
					eq(notifications.status, "SENT"),
				),
			);
		return result[0]?.count ?? 0;
	}

	async markAsRead(id: NotificationId, userId: number) {
		const [updated] = await this.drizzle.db
			.update(notifications)
			.set({ readAt: new Date().toISOString() })
			.where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
			.returning();
		if (!updated) throw new NotFoundException(`Notification ${id} not found`);
		return updated;
	}

	async markAllAsRead(userId: number) {
		const updated = await this.drizzle.db
			.update(notifications)
			.set({ readAt: new Date().toISOString() })
			.where(
				and(
					eq(notifications.userId, userId),
					isNull(notifications.readAt),
					eq(notifications.status, "SENT"),
				),
			)
			.returning();
		return { count: updated.length };
	}

	async markAsSent(id: NotificationId) {
		const [updated] = await this.drizzle.db
			.update(notifications)
			.set({ status: "SENT", sentAt: new Date().toISOString() })
			.where(eq(notifications.id, id))
			.returning();
		return updated;
	}

	async markAsFailed(id: NotificationId, error: string) {
		const [updated] = await this.drizzle.db
			.update(notifications)
			.set({
				status: "FAILED",
				errorMessage: error,
				retryCount: sql`${notifications.retryCount} + 1`,
			})
			.where(eq(notifications.id, id))
			.returning();
		return updated;
	}
}
