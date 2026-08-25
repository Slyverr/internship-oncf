import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orderFiles } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { OrderId } from "@/orders/orders.types";
import { StorageService } from "@/storage/storage.service";
import type { MulterFile } from "@/storage/storage.types";
import { fileColumns } from "./files.query";
import { UploadFileDto } from "./requests/upload-file.dto";

@Injectable()
export class FilesService {
	constructor(
		private readonly drizzle: DrizzleService,
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

		const [record] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(orderFiles)
					.values({
						orderId,
						fileName: file.originalname,
						fileType: file.mimetype,
						fileSize: file.size,
						filePath,
						mimeType: file.mimetype,
						uploadedByUserId: userId,
						description: dto.description ?? null,
					})
					.returning(),
			{ orderId, file: file.originalname },
		);

		return record;
	}

	async listFiles(orderId: OrderId) {
		return this.drizzle.db.query.orderFiles.findMany({
			where: { orderId },
			columns: fileColumns,
			orderBy: (files, { desc }) => [desc(files.uploadedAt)],
		});
	}

	async downloadFile(orderId: OrderId, fileId: number) {
		const file = await this.drizzle.db.query.orderFiles.findFirst({
			where: {
				fileId,
				orderId,
			},
			columns: {
				fileId: true,
				fileName: true,
				filePath: true,
				mimeType: true,
			},
		});

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
		const file = await this.drizzle.db.query.orderFiles.findFirst({
			where: {
				fileId,
				orderId,
			},
			columns: {
				fileId: true,
				filePath: true,
			},
		});

		if (!file) {
			throw new NotFoundException(
				`File ${fileId} not found for order ${orderId}`,
			);
		}

		await this.storageService.deleteFile(file.filePath);

		await this.drizzle.db
			.delete(orderFiles)
			.where(
				and(eq(orderFiles.fileId, fileId), eq(orderFiles.orderId, orderId)),
			);
	}
}
