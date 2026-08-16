import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { orderFiles } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import type { OrderId } from "src/orders/orders.types";
import { StorageService } from "src/storage/storage.service";
import { MulterFile } from "src/storage/storage.types";
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
						uploadedBy: userId,
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
			orderBy: (files, { desc }) => [desc(files.uploadedAt)],
		});
	}

	async downloadFile(orderId: OrderId, fileId: string) {
		const file = await this.drizzle.db.query.orderFiles.findFirst({
			where: {
				fileId: parseInt(fileId, 10),
				orderId,
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
			mimeType: file.mimeType || "application/octet-stream",
		};
	}

	async deleteFile(orderId: OrderId, fileId: string) {
		const file = await this.drizzle.db.query.orderFiles.findFirst({
			where: {
				fileId: parseInt(fileId, 10),
				orderId,
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
				and(
					eq(orderFiles.fileId, parseInt(fileId, 10)),
					eq(orderFiles.orderId, orderId),
				),
			);
	}
}
