import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsQuery } from "./notifications.query";
import type { NotificationId } from "./notifications.types";
import { CreateNotificationDto } from "./requests/create-notification.dto";

@Injectable()
export class NotificationsService {
	constructor(
		private readonly notificationsQuery: NotificationsQuery,
		private readonly notificationsMapper: NotificationsMapper,
	) {}

	async create(dto: CreateNotificationDto) {
		const values = this.notificationsMapper.toCreate(dto);
		const created = await this.notificationsQuery.createNotification(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		return this.notificationsQuery.findNotifications(user.id);
	}

	async findOne(id: NotificationId) {
		const notification = await this.notificationsQuery.findNotification(id);
		return this.ensure(notification, id);
	}

	async findOneForOwnership(id: NotificationId) {
		const notification =
			await this.notificationsQuery.findNotificationForOwnership(id);
		return this.ensure(notification, id);
	}

	async getUnreadCount(userId: number) {
		return this.notificationsQuery.findUnreadCount(userId);
	}

	async markAsRead(id: NotificationId, userId: number) {
		const updated = await this.notificationsQuery.updateNotificationRead(
			id,
			userId,
		);
		if (!updated) {
			throw new NotFoundException(`Notification ${id} not found`);
		}
		return this.findOne(id);
	}

	async markAllAsRead(userId: number) {
		const updated =
			await this.notificationsQuery.updateAllNotificationsRead(userId);
		return {
			count: updated.length,
		};
	}

	async markAsSent(id: NotificationId) {
		return this.notificationsQuery.markNotificationAsSent(id);
	}

	async markAsFailed(id: NotificationId, error: string) {
		return this.notificationsQuery.markNotificationAsFailed(id, error);
	}

	private ensure<T>(notification: T | undefined, id: NotificationId): T {
		if (!notification) {
			throw new NotFoundException(`Notification ${id} not found`);
		}
		return notification;
	}
}
