import { orderFiles } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { FilesService } from "./files.service";

export type OrderFile = InferSelectModel<typeof orderFiles>;

export type OrderFileInsert = InferInsertModel<typeof orderFiles>;

export type OrderFileId = OrderFile["fileId"];

export type UploadFile = Awaited<ReturnType<FilesService["uploadFile"]>>;

export type ListFiles = Awaited<ReturnType<FilesService["listFiles"]>>[number];
