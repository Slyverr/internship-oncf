import { orderFiles } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { FilesService } from "./files.service";

export type OrderFile = InferSelectModel<typeof orderFiles>;
export type OrderFileInsert = InferInsertModel<typeof orderFiles>;
export type OrderFileId = OrderFile["id"];

export interface OrderFileView {
	id: number;
	orderId: number;
	fileName: string;
	description: string | null;
	fileSize: number;
	mimeType: string;
	uploadedByUserId: number;
	uploadedAt: string;
}

export type UploadFile = Awaited<ReturnType<FilesService["uploadFile"]>>;
export type ListFiles = Awaited<ReturnType<FilesService["listFiles"]>>[number];
