import { QueryColumns } from "src/db/drizzle.types";

type OrderFilesColumns = QueryColumns<"orderFiles">;

export const fileColumns = {
	fileId: true,
	orderId: true,
	fileName: true,
	fileType: true,
	fileSize: true,
	filePath: true,
	mimeType: true,
	uploadedBy: true,
	description: true,
	uploadedAt: true,
} satisfies OrderFilesColumns;
