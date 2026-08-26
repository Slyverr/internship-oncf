import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { DrizzleService } from "@/database/drizzle.service";
import { toCreate } from "./notifications.mapper";
import {
	createNotification,
	findNotification,
	findNotificationForOwnership,
	findNotifications,
	findUnreadCount,
	markNotificationAsFailed,
	markNotificationAsSent,
	updateAllNotificationsRead,
	updateNotificationRead,
} from "./notifications.query";
import type { NotificationId } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

@Injectable()
export class NotificationsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateNotificationDto) {
		const created = await createNotification(this.drizzle.db, toCreate(dto));
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		return findNotifications(this.drizzle.db, user.id);
	}

	async findOne(id: NotificationId) {
		return this.ensure(await findNotification(this.drizzle.db, id), id);
	}

	async findOneForOwnership(id: NotificationId) {
		return this.ensure(
			await findNotificationForOwnership(this.drizzle.db, id),
			id,
		);
	}

	async getUnreadCount(userId: number) {
		return findUnreadCount(this.drizzle.db, userId);
	}

	async markAsRead(id: NotificationId, userId: number) {
		const updated = await updateNotificationRead(this.drizzle.db, id, userId);
		if (!updated) {
			throw new NotFoundException(`Notification ${id} not found`);
		}

		return this.findOne(id);
	}

	async markAllAsRead(userId: number) {
		const updated = await updateAllNotificationsRead(this.drizzle.db, userId);
		return {
			count: updated.length,
		};
	}

	async markAsSent(id: NotificationId) {
		return markNotificationAsSent(this.drizzle.db, id);
	}

	async markAsFailed(id: NotificationId, error: string) {
		return markNotificationAsFailed(this.drizzle.db, id, error);
	}

	private ensure<T>(notification: T | undefined, id: NotificationId) {
		if (!notification) {
			throw new NotFoundException(`Notification ${id} not found`);
		}

		return notification;
	}
}
