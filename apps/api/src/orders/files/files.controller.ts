import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
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
import {
	ApiBadRequestResponse,
	ApiConsumes,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Response } from "express";
import type { AuthRequest } from "src/auth/auth.types";
import { RequireAny } from "src/auth/permissions.decorator";
import { MessageResponseDto } from "src/common/responses/message.dto";
import { OrderOwnershipGuard } from "src/orders/guards/order-ownership.guard";
import type { OrderId } from "src/orders/orders.types";
import { OrderIdPipe } from "src/orders/pipes/order-id.pipe";
import type { MulterFile } from "src/storage/storage.types";
import { FilesService } from "./files.service";
import { UploadFileDto } from "./requests/upload-file.dto";
import { ListFilesResponseDto } from "./responses/list-files.dto";
import { UploadFileResponseDto } from "./responses/upload-file.dto";

const OrderIdParam = () => Param("id", OrderIdPipe);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller("orders/:id/files")
@UseGuards(OrderOwnershipGuard)
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post()
	@RequireAny(Permission.ORDERS_UPDATE)
	@UseInterceptors(FileInterceptor("file"))
	@ApiConsumes("multipart/form-data")
	@ApiOkResponse({ type: UploadFileResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async uploadFile(
		@OrderIdParam() id: OrderId,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
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
	@ApiOkResponse({ type: [ListFilesResponseDto] })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async listFiles(@OrderIdParam() id: OrderId) {
		return this.filesService.listFiles(id);
	}

	@Get(":fileId/download")
	@RequireAny(Permission.ORDERS_READ)
	@ApiOkResponse({ description: "File downloaded successfully" })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async downloadFile(
		@OrderIdParam() id: OrderId,
		@Param("fileId") fileId: string,
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
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.ORDERS_UPDATE)
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async deleteFile(
		@OrderIdParam() id: OrderId,
		@Param("fileId") fileId: string,
	) {
		await this.filesService.deleteFile(id, fileId);
		return { message: "File deleted successfully" };
	}
}
