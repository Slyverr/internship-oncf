import { API_RESPONSE_CODES, Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	Request,
	Res,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import type { Response } from "express";
import {
	ALLOWED_ATTACHMENT_MIME_TYPES,
	MAX_ATTACHMENT_SIZE,
} from "@/attachments/attachments.constants";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { ApiCodedErrorResponse } from "@/common/decorators/api-coded-error-response.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import {
	ApiPathParam,
	ApiStringPathParam,
} from "@/common/decorators/api-path-param.decorator";
import { SuccessResponseDto } from "@/common/responses/success-response.dto";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import { OrdersService } from "@/orders/orders.service";
import type { OrderNumber } from "@/orders/orders.types";
import { OrderNumberPipe } from "@/orders/pipes/order-number.pipe";
import { UploadedFileParam } from "@/storage/decorators/uploaded-file.decorator";
import type { UploadedFile } from "@/storage/storage.types";
import { FilesService } from "./files.service";
import { FileIdPipe } from "./pipes/file-id.pipe";
import { UploadFileDto } from "./requests/upload-file.dto";
import { FileDto } from "./responses/file.dto";

const OrderNumberParam = () => ApiStringPathParam("id", OrderNumberPipe);
const FileIdParam = () => ApiPathParam("fileId", FileIdPipe);

const {
	list: FileListResponse,
	create: FileCreateResponse,
	remove: FileDeleteResponse,
} = createCrudResponses({
	list: FileDto,
	detail: FileDto,
	create: FileDto,
	remove: SuccessResponseDto,
});

@Controller("orders/:id/files")
@UseGuards(OrderOwnershipGuard)
export class FilesController {
	constructor(
		private readonly filesService: FilesService,
		private readonly ordersService: OrdersService,
	) {}

	@Post()
	@RequireAny(Permission.ORDERS_UPDATE)
	@UseInterceptors(FileInterceptor("file"))
	@ApiConsumes("multipart/form-data")
	@FileCreateResponse()
	@ApiCodedErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY)
	async uploadFile(
		@OrderNumberParam() number: OrderNumber,
		@UploadedFileParam(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: MAX_ATTACHMENT_SIZE }),
					new FileTypeValidator({ fileType: ALLOWED_ATTACHMENT_MIME_TYPES }),
				],
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		file: UploadedFile,
		@Body() dto: UploadFileDto,
		@Request() req: AuthRequest,
	) {
		return this.filesService.uploadFile(
			await this.ordersService.resolveOrderId(number),
			file,
			dto,
			req.user.id,
		);
	}

	@Get()
	@RequireAny(Permission.ORDERS_READ)
	@FileListResponse()
	async listFiles(@OrderNumberParam() number: OrderNumber) {
		return this.filesService.listFiles(
			await this.ordersService.resolveOrderId(number),
		);
	}

	@Get(":fileId/download")
	@RequireAny(Permission.ORDERS_READ)
	async downloadFile(
		@OrderNumberParam() number: OrderNumber,
		@FileIdParam() fileId: number,
		@Res() res: Response,
	) {
		const file = await this.filesService.downloadFile(
			await this.ordersService.resolveOrderId(number),
			fileId,
		);

		res.setHeader("Content-Type", file.mimeType);
		const safeFileName = [...file.fileName]
			.map((character) => {
				const code = character.charCodeAt(0);
				const unsafe =
					code < 0x20 ||
					code === 0x7f ||
					character === "/" ||
					character === "\\" ||
					character === '"';
				return unsafe ? "_" : character;
			})
			.join("");
		const fallbackFileName = safeFileName.replace(/[^\x20-\x7E]/g, "_");
		const encodedFileName = encodeURIComponent(safeFileName).replace(
			/[!'()*]/g,
			(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodedFileName}`,
		);
		res.send(file.buffer);
	}

	@Delete(":fileId")
	@RequireAny(Permission.ORDERS_UPDATE)
	@FileDeleteResponse()
	async deleteFile(
		@OrderNumberParam() number: OrderNumber,
		@FileIdParam() fileId: number,
	) {
		await this.filesService.deleteFile(
			await this.ordersService.resolveOrderId(number),
			fileId,
		);

		return { code: API_RESPONSE_CODES.ORDER_ATTACHMENT_DELETED };
	}
}
