import { Assert, Equals } from "@/common/utils/type-assertions";
import type { ListFiles, UploadFile } from "../files.types";

type _UploadAssertion = Assert<Equals<FileDto, UploadFile>>;
type _ListAssertion = Assert<Equals<FileDto, ListFiles>>;

export class FileDto implements UploadFile, ListFiles {
	id: number;
	orderId: number;
	fileName: string;
	description: string | null;
	fileSize: number;
	mimeType: string;
	uploadedByUserId: number;
	uploadedAt: string;
}
