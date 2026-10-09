import { API_ERROR_CODES, Permission } from "@ecommand/shared";
import { Injectable, NotFoundException, Optional } from "@nestjs/common";
import { AttachmentsService } from "@/attachments/attachments.service";
import type { OrderId } from "@/orders/orders.types";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
import type { UploadedFile } from "@/storage/storage.types";
import { FilesQuery } from "./files.query";
import type { OrderFileView } from "./files.types";
import { UploadFileDto } from "./requests/upload-file.dto";

@Injectable()
export class FilesService {
	constructor(
		private readonly filesQuery: FilesQuery,
		private readonly attachmentsService: AttachmentsService,
		@Optional() private readonly realtimeEvents?: RealtimeEventsService,
	) {}

	async uploadFile(
		orderId: OrderId,
		file: UploadedFile,
		dto: UploadFileDto,
		userId: number,
	): Promise<OrderFileView> {
		const attachment = await this.attachmentsService.upsert(file);

		const link = await this.filesQuery.createFile({
			orderId,
			attachmentId: attachment.id,
			fileName: file.originalName,
			description: dto.description ?? null,
			uploadedByUserId: userId,
		});
		this.publishOrderChanged();

		return {
			id: link.id,
			orderId: link.orderId,
			fileName: link.fileName,
			description: link.description,
			fileSize: attachment.fileSize,
			mimeType: attachment.mimeType,
			uploadedByUserId: link.uploadedByUserId,
			uploadedAt: link.uploadedAt,
		};
	}

	async listFiles(orderId: OrderId): Promise<OrderFileView[]> {
		return this.filesQuery.findFiles(orderId);
	}

	async downloadFile(orderId: OrderId, fileId: number) {
		const link = await this.filesQuery.findFileForDownload(orderId, fileId);
		if (!link) {
			throw new NotFoundException({
				code: API_ERROR_CODES.ORDER_FILE_NOT_FOUND,
			});
		}

		const buffer = await this.attachmentsService.download(link.attachmentId);

		return {
			buffer,
			fileName: link.fileName,
			mimeType: link.mimeType,
		};
	}

	async deleteFile(orderId: OrderId, fileId: number) {
		const link = await this.filesQuery.findFileForDelete(orderId, fileId);
		if (!link) {
			throw new NotFoundException({
				code: API_ERROR_CODES.ORDER_FILE_NOT_FOUND,
			});
		}

		await this.filesQuery.softDelete(orderId, fileId);
		this.publishOrderChanged();
	}

	private publishOrderChanged() {
		this.realtimeEvents?.publishToPermission(
			Permission.ORDERS_READ,
			REALTIME_EVENT_TYPES.ordersChanged,
		);
	}
}
