import { orderFiles } from "drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { DrizzleDb, QueryColumns } from "@/database/drizzle.types";
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

export async function createFile(db: DrizzleDb, values: OrderFileInsert) {
	const [record] = await withDbErrorHandling(
		() => db.insert(orderFiles).values(values).returning(),
		values,
	);

	return record;
}

export async function findFiles(db: DrizzleDb, orderId: OrderId) {
	return db.query.orderFiles.findMany({
		where: { orderId },
		columns: fileColumns,
		orderBy: (files) => [desc(files.uploadedAt)],
	});
}

export async function findFileForDownload(
	db: DrizzleDb,
	orderId: OrderId,
	fileId: number,
) {
	return db.query.orderFiles.findFirst({
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

export async function findFileForDelete(
	db: DrizzleDb,
	orderId: OrderId,
	fileId: number,
) {
	return db.query.orderFiles.findFirst({
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

export async function removeFile(
	db: DrizzleDb,
	orderId: OrderId,
	fileId: number,
) {
	return db
		.delete(orderFiles)
		.where(and(eq(orderFiles.fileId, fileId), eq(orderFiles.orderId, orderId)));
}
