import { Injectable, NotFoundException } from "@nestjs/common";
import { AttachmentsService } from "@/attachments/attachments.service";
import type { OrderId } from "@/orders/orders.types";
import type { UploadedFile } from "@/storage/storage.types";
import { FilesQuery } from "./files.query";
import type { OrderFileView } from "./files.types";
import { UploadFileDto } from "./requests/upload-file.dto";

@Injectable()
export class FilesService {
	constructor(
		private readonly filesQuery: FilesQuery,
		private readonly attachmentsService: AttachmentsService,
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
			throw new NotFoundException(
				`File ${fileId} not found for order ${orderId}`,
			);
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
			throw new NotFoundException(
				`File ${fileId} not found for order ${orderId}`,
			);
		}

		await this.filesQuery.softDelete(orderId, fileId);
	}
}
