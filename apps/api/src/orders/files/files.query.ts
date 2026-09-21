import { Injectable } from "@nestjs/common";
import { attachments, orderFiles } from "drizzle/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { OrderId } from "@/orders/orders.types";
import type { OrderFileInsert, OrderFileView } from "./files.types";

@Injectable()
export class FilesQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createFile(values: OrderFileInsert) {
		const [record] = await withDbErrorHandling(
			() => this.drizzle.db.insert(orderFiles).values(values).returning(),
			values,
		);
		return record;
	}

	async findFiles(orderId: OrderId): Promise<OrderFileView[]> {
		return this.drizzle.db
			.select({
				id: orderFiles.id,
				orderId: orderFiles.orderId,
				fileName: orderFiles.fileName,
				description: orderFiles.description,
				fileSize: attachments.fileSize,
				mimeType: attachments.mimeType,
				uploadedByUserId: orderFiles.uploadedByUserId,
				uploadedAt: orderFiles.uploadedAt,
			})
			.from(orderFiles)
			.innerJoin(attachments, eq(orderFiles.attachmentId, attachments.id))
			.where(and(eq(orderFiles.orderId, orderId), isNull(orderFiles.deletedAt)))
			.orderBy(desc(orderFiles.uploadedAt));
	}

	async findFileForDownload(orderId: OrderId, fileId: number) {
		const [row] = await this.drizzle.db
			.select({
				id: orderFiles.id,
				attachmentId: orderFiles.attachmentId,
				fileName: orderFiles.fileName,
				mimeType: attachments.mimeType,
			})
			.from(orderFiles)
			.innerJoin(attachments, eq(orderFiles.attachmentId, attachments.id))
			.where(
				and(
					eq(orderFiles.id, fileId),
					eq(orderFiles.orderId, orderId),
					isNull(orderFiles.deletedAt),
				),
			)
			.limit(1);

		return row;
	}

	async findFileForDelete(orderId: OrderId, fileId: number) {
		const [row] = await this.drizzle.db
			.select({ id: orderFiles.id })
			.from(orderFiles)
			.where(
				and(
					eq(orderFiles.id, fileId),
					eq(orderFiles.orderId, orderId),
					isNull(orderFiles.deletedAt),
				),
			)
			.limit(1);

		return row;
	}

	async softDelete(orderId: OrderId, fileId: number) {
		await this.drizzle.db
			.update(orderFiles)
			.set({ deletedAt: sql`CURRENT_TIMESTAMP` })
			.where(
				and(
					eq(orderFiles.id, fileId),
					eq(orderFiles.orderId, orderId),
					isNull(orderFiles.deletedAt),
				),
			);
	}
}
