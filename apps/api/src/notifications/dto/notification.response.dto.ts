export class NotificationResponseDto {
	id: number;
	userId: number;
	typeId: number;
	channelId: number;
	title: string;
	message: string;
	status: string;
	readAt?: string;
	sentAt?: string;
	relatedEntityType?: string;
	relatedEntityId?: number;
	retryCount: number;
	errorMessage?: string;
	createdAt: string;
}
