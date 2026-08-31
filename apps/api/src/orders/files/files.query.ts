import { Injectable } from "@nestjs/common";
import { orderFiles } from "drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { OrderId } from "@/orders/orders.types";
import { OrderFileInsert } from "./files.types";

type OrderFilesColumns = QueryColumns<"orderFiles">;

const fileColumns = {
	fileId: true,
	orderId: true,
	fileName: true,
	fileType: true,
	fileSize: true,
	filePath: true,
	mimeType: true,
	uploadedByUserId: true,
	description: true,
	uploadedAt: true,
} satisfies OrderFilesColumns;

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

	async findFiles(orderId: OrderId) {
		return this.drizzle.db.query.orderFiles.findMany({
			where: { orderId },
			columns: fileColumns,
			orderBy: (files) => [desc(files.uploadedAt)],
		});
	}

	async findFileForDownload(orderId: OrderId, fileId: number) {
		return this.drizzle.db.query.orderFiles.findFirst({
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
	}

	async findFileForDelete(orderId: OrderId, fileId: number) {
		return this.drizzle.db.query.orderFiles.findFirst({
			where: {
				fileId,
				orderId,
			},
			columns: {
				fileId: true,
				filePath: true,
			},
		});
	}

	async removeFile(orderId: OrderId, fileId: number) {
		return this.drizzle.db
			.delete(orderFiles)
			.where(
				and(eq(orderFiles.fileId, fileId), eq(orderFiles.orderId, orderId)),
			);
	}
}
