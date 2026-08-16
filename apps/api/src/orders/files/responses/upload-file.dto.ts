export class UploadFileResponseDto {
	fileId: number;
	orderId: number;
	fileName: string;
	fileType: string;
	fileSize: number;
	filePath: string;
	mimeType: string;
	uploadedBy: number;
	description?: string;
	uploadedAt: string;
}
