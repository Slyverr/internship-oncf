import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Request,
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { ApiCodedErrorResponse } from "@/common/decorators/api-coded-error-response.decorator";
import { DtmOperationsService } from "./dtm-operations.service";
import { ResolveDtmRequestDto } from "./requests/resolve-dtm-request.dto";
import {
	DtmOperationsDto,
	DtmRequestResolutionDto,
} from "./responses/dtm-request.dto";

@Controller("dtm/requests")
@RequireAny(Permission.INTEGRATIONS_MANAGE)
export class DtmOperationsController {
	constructor(private readonly dtmOperations: DtmOperationsService) {}

	@Get()
	@ApiOkResponse({ type: DtmOperationsDto })
	list() {
		return this.dtmOperations.list();
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({ type: DtmRequestResolutionDto })
	@ApiCodedErrorResponse(HttpStatus.CONFLICT)
	resolve(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: ResolveDtmRequestDto,
		@Request() request: AuthRequest,
	) {
		return this.dtmOperations.resolve(id, dto.result, request.user.id);
	}
}
