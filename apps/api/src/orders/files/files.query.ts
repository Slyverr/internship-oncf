import { QueryColumns } from "src/database/drizzle.types";

type OrderFilesColumns = QueryColumns<"orderFiles">;

export const fileColumns = {
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
