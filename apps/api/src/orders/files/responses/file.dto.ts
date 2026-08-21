import { Assert, Equals } from "src/common/utils/type-assertions";
import { ListFiles, UploadFile } from "../files.types";

type _UploadAssertion = Assert<Equals<FileDto, UploadFile>>;
type _ListAssertion = Assert<Equals<FileDto, ListFiles>>;

export class FileDto implements UploadFile, ListFiles {
	fileId: number;
	orderId: number;
	fileName: string;
	fileType: string;
	fileSize: number;
	filePath: string;
	mimeType: string | null;
	uploadedBy: number;
	description: string | null;
	uploadedAt: string;
}
