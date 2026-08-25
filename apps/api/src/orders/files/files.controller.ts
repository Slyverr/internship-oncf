import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpStatus,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Post,
	Request,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import type { Response } from "express";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { MessageResponseDto } from "@/common/responses/message.dto";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import type { OrderId } from "@/orders/orders.types";
import { OrderIdPipe } from "@/orders/pipes/order-id.pipe";
import type { MulterFile } from "@/storage/storage.types";
import { FilesService } from "./files.service";
import { FileIdPipe } from "./pipes/file-id.pipe";
import { UploadFileDto } from "./requests/upload-file.dto";
import { FileDto } from "./responses/file.dto";

const OrderIdParam = () => Param("id", OrderIdPipe);
const FileIdParam = () => Param("fileId", FileIdPipe);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const {
	list: FileListResponse,
	create: FileCreateResponse,
	remove: FileDeleteResponse,
} = createCrudResponses({
	list: FileDto,
	detail: FileDto,
	create: FileDto,
	remove: MessageResponseDto,
});

@Controller("orders/:id/files")
@UseGuards(OrderOwnershipGuard)
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post()
	@RequireAny(Permission.ORDERS_UPDATE)
	@UseInterceptors(FileInterceptor("file"))
	@ApiConsumes("multipart/form-data")
	@FileCreateResponse()
	@ApiUnprocessableEntityResponse()
	async uploadFile(
		@OrderIdParam() id: OrderId,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({
						maxSize: MAX_FILE_SIZE,
					}),
					new FileTypeValidator({
						fileType:
							/^(image\/(jpeg|png|gif|webp)|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/plain)$/,
					}),
				],
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		file: MulterFile,
		@Body() dto: UploadFileDto,
		@Request() req: AuthRequest,
	) {
		return this.filesService.uploadFile(id, file, dto, req.user.id);
	}

	@Get()
	@RequireAny(Permission.ORDERS_READ)
	@FileListResponse()
	async listFiles(@OrderIdParam() id: OrderId) {
		return this.filesService.listFiles(id);
	}

	@Get(":fileId/download")
	@RequireAny(Permission.ORDERS_READ)
	async downloadFile(
		@OrderIdParam() id: OrderId,
		@FileIdParam() fileId: number,
		@Res() res: Response,
	) {
		const file = await this.filesService.downloadFile(id, fileId);

		res.setHeader("Content-Type", file.mimeType);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${file.fileName}"`,
		);

		res.send(file.buffer);
	}

	@Delete(":fileId")
	@RequireAny(Permission.ORDERS_UPDATE)
	@FileDeleteResponse()
	async deleteFile(@OrderIdParam() id: OrderId, @FileIdParam() fileId: number) {
		await this.filesService.deleteFile(id, fileId);

		return {
			message: "File deleted successfully",
		};
	}
}
