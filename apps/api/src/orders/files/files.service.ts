import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { OrderId } from "@/orders/orders.types";
import { StorageService } from "@/storage/storage.service";
import type { MulterFile } from "@/storage/storage.types";
import { FilesQuery } from "./files.query";
import { UploadFileDto } from "./requests/upload-file.dto";

@Injectable()
export class FilesService {
	constructor(
		private readonly filesQuery: FilesQuery,
		private readonly storageService: StorageService,
	) {}

	async uploadFile(
		orderId: OrderId,
		file: MulterFile,
		dto: UploadFileDto,
		userId: number,
	) {
		if (!file) {
			throw new BadRequestException("No file provided");
		}

		const filePath = `orders/${orderId}/${Date.now()}-${file.originalname}`;
		await this.storageService.uploadFile(filePath, file);

		return this.filesQuery.createFile({
			orderId,
			fileName: file.originalname,
			fileType: file.mimetype,
			fileSize: file.size,
			filePath,
			mimeType: file.mimetype,
			uploadedByUserId: userId,
			description: dto.description ?? null,
		});
	}

	async listFiles(orderId: OrderId) {
		return this.filesQuery.findFiles(orderId);
	}

	async downloadFile(orderId: OrderId, fileId: number) {
		const file = await this.filesQuery.findFileForDownload(orderId, fileId);
		if (!file) {
			throw new NotFoundException(
				`File ${fileId} not found for order ${orderId}`,
			);
		}

		const buffer = await this.storageService.downloadFile(file.filePath);
		return {
			buffer,
			fileName: file.fileName,
			mimeType: file.mimeType ?? "application/octet-stream",
		};
	}

	async deleteFile(orderId: OrderId, fileId: number) {
		const file = await this.filesQuery.findFileForDelete(orderId, fileId);
		if (!file) {
			throw new NotFoundException(
				`File ${fileId} not found for order ${orderId}`,
			);
		}

		await this.storageService.deleteFile(file.filePath);
		await this.filesQuery.removeFile(orderId, fileId);
	}
}
