import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	type NotificationMessage,
	NotificationMessageCode,
} from "@ecommand/shared";
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
		return this.toPresentations(
			await this.notificationsQuery.findNotifications(user.id),
		);
	}

	async findOne(id: NotificationId) {
		const notification = await this.notificationsQuery.findNotification(id);
		return this.toPresentations([this.ensure(notification)]).then(
			([presented]) => presented,
		);
	}

	async findOneForOwnership(id: NotificationId) {
		const notification =
			await this.notificationsQuery.findNotificationForOwnership(id);
		return this.ensure(notification);
	}

	async getUnreadCount(userId: number) {
		return {
			count: Number(await this.notificationsQuery.findUnreadCount(userId)),
		};
	}

	async markAsRead(id: NotificationId, userId: number) {
		const updated = await this.notificationsQuery.updateNotificationRead(
			id,
			userId,
		);
		if (!updated) {
			throw new NotFoundException({
				code: API_ERROR_CODES.NOTIFICATION_NOT_FOUND,
			});
		}
		return this.findOne(id);
	}

	async markAllAsRead(userId: number) {
		const updated =
			await this.notificationsQuery.updateAllNotificationsRead(userId);
		return {
			count: updated.length,
			code: API_RESPONSE_CODES.NOTIFICATIONS_MARKED_READ,
		};
	}

	async markAsSent(id: NotificationId) {
		return this.notificationsQuery.markNotificationAsSent(id);
	}

	async markAsFailed(id: NotificationId, error: string) {
		return this.notificationsQuery.markNotificationAsFailed(id, error);
	}

	createChangeRecord(
		recipientId: number,
		actorId: number,
		entity: "orders" | "programs" | "claims",
		entityId: number,
		content: NotificationMessage,
	) {
		return this.notificationsMapper.toChange(
			recipientId,
			actorId,
			entity,
			entityId,
			content,
		);
	}

	private async toPresentations<
		NotificationRecord extends {
			title?: string | null;
			message: string | null;
			messageCode: NotificationMessageCode | null;
			messageParameters: Record<string, string> | null;
			errorMessage?: string | null;
			relatedEntityType?: string | null;
			relatedEntityId?: number | null;
		},
	>(
		notifications: NotificationRecord[],
	): Promise<
		Array<
			Omit<
				NotificationRecord,
				| "title"
				| "message"
				| "messageCode"
				| "messageParameters"
				| "errorMessage"
			> & {
				messageCode: NotificationMessageCode;
				messageParameters: Record<string, string>;
			}
		>
	> {
		const recordCodes = await this.notificationsQuery.findRelatedRecordCodes(
			notifications.map(({ relatedEntityId, relatedEntityType }) => ({
				relatedEntityId: relatedEntityId ?? null,
				relatedEntityType: relatedEntityType ?? null,
			})),
		);
		const recordCodeByReference = new Map(
			recordCodes.map((item) => [
				`${item.relatedEntityType}:${item.relatedEntityId}`,
				item.recordCode,
			]),
		);

		return notifications.map((notification) => {
			const key = `${notification.relatedEntityType}:${notification.relatedEntityId}`;
			return this.toPresentation(notification, recordCodeByReference.get(key));
		});
	}

	private toPresentation<
		NotificationRecord extends {
			title?: string | null;
			message: string | null;
			messageCode: NotificationMessageCode | null;
			messageParameters: Record<string, string> | null;
			errorMessage?: string | null;
		},
	>(
		notification: NotificationRecord,
		canonicalRecordCode?: string,
	): Omit<
		NotificationRecord,
		"title" | "message" | "messageCode" | "messageParameters" | "errorMessage"
	> & {
		messageCode: NotificationMessageCode;
		messageParameters: Record<string, string>;
	} {
		const publicNotification = { ...notification };
		delete (publicNotification as { errorMessage?: string | null })
			.errorMessage;
		const {
			title: _title,
			message,
			messageCode,
			messageParameters,
			...details
		} = publicNotification;
		const legacyComment = message?.match(
			/^A new comment was added to claim (.+?)\.?$/,
		);
		const parameters =
			messageParameters && Object.keys(messageParameters).length > 0
				? messageParameters
				: legacyComment
					? { recordCode: legacyComment[1] }
					: {};
		if (canonicalRecordCode) parameters.recordCode = canonicalRecordCode;

		return {
			...details,
			messageCode:
				messageCode ??
				(legacyComment
					? NotificationMessageCode.CLAIM_COMMENT_ADDED
					: NotificationMessageCode.LEGACY_UPDATE),
			messageParameters: parameters,
		} as Omit<
			NotificationRecord,
			"title" | "message" | "messageCode" | "messageParameters" | "errorMessage"
		> & {
			messageCode: NotificationMessageCode;
			messageParameters: Record<string, string>;
		};
	}

	private ensure<T>(notification: T | undefined): T {
		if (!notification) {
			throw new NotFoundException({
				code: API_ERROR_CODES.NOTIFICATION_NOT_FOUND,
			});
		}
		return notification;
	}
}
