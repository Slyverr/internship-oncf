import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UploadedFile } from "../storage.types";

interface RawMultipartFile {
	originalname: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
}

interface RequestWithFile {
	file?: RawMultipartFile;
}

export const UploadedFileParam = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): UploadedFile | undefined => {
		const request = ctx.switchToHttp().getRequest<RequestWithFile>();
		const file = request.file;

		if (!file) {
			return undefined;
		}

		return {
			originalName: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
			buffer: file.buffer,
		};
	},
);
