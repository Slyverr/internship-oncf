export interface UploadedFile {
	originalName: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
}

export interface StoredFile {
	hash: string;
	path: string;
}
