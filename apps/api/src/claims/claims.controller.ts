import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import {
	ApiResponses,
	type ApiResponsesOptions,
	ApiResponsesPatch,
} from "src/common/decorators/api-responses.decorator";
import { ClaimsService } from "./claims.service";
import type { ClaimId } from "./claims.types";
import { ClaimOwnershipGuard } from "./guards/claim-ownership.guard";
import { ClaimIdPipe } from "./pipes/claim-id.pipe";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";
import { ClaimCommentDto } from "./responses/claim-comment.dto";
import { ClaimDeleteDto } from "./responses/claim-delete.dto";
import { ClaimDetailDto } from "./responses/claim-detail.dto";
import { ClaimListDto } from "./responses/claim-list.dto";

const ClaimIdParam = () => Param("id", ClaimIdPipe);

const ClaimBaseResponse: ApiResponsesOptions = {
	status: HttpStatus.OK,
	type: ClaimDetailDto,
	errors: [
		HttpStatus.UNAUTHORIZED,
		HttpStatus.BAD_REQUEST,
		HttpStatus.FORBIDDEN,
		HttpStatus.NOT_FOUND,
	],
};

const ClaimDetailResponse = () => ApiResponses(ClaimBaseResponse);

const ClaimCreateResponse = () =>
	ApiResponsesPatch(ClaimBaseResponse, {
		status: HttpStatus.CREATED,
		removeErrors: [HttpStatus.NOT_FOUND],
	});

const ClaimListResponse = () =>
	ApiResponsesPatch(ClaimBaseResponse, {
		type: [ClaimListDto],
		errors: [HttpStatus.UNAUTHORIZED],
	});

const ClaimDeleteResponse = () =>
	ApiResponsesPatch(ClaimBaseResponse, {
		type: ClaimDeleteDto,
		removeErrors: [HttpStatus.BAD_REQUEST],
	});

@Controller("claims")
@UseGuards(ClaimOwnershipGuard)
export class ClaimsController {
	constructor(private readonly claimsService: ClaimsService) {}

	@Post()
	@Permissions(Permission.CLAIMS_CREATE)
	@ClaimCreateResponse()
	async create(@Body() dto: CreateClaimDto, @Request() req: AuthRequest) {
		return this.claimsService.create(dto, req.user);
	}

	@Get()
	@Permissions(Permission.CLAIMS_READ)
	@ClaimListResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.claimsService.findAll(req.user);
	}

	@Get(":id")
	@Permissions(Permission.CLAIMS_READ)
	@ClaimDetailResponse()
	async findOne(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async update(
		@ClaimIdParam() id: ClaimId,
		@Body() dto: UpdateClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.update(id, dto, req.user);
	}

	@Delete(":id")
	@Permissions(Permission.CLAIMS_DELETE)
	@ClaimDeleteResponse()
	async remove(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.remove(id);
	}

	@Post(":id/comments")
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiResponses({ status: HttpStatus.OK, type: ClaimCommentDto })
	async addComment(
		@ClaimIdParam() id: ClaimId,
		@Body("content") content: string,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.addComment(id, content, req.user.id);
	}

	@Get(":id/comments")
	@Permissions(Permission.CLAIMS_READ)
	@ApiResponses({ status: HttpStatus.OK, type: [ClaimCommentDto] })
	async getComments(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.getComments(id);
	}

	@Post(":id/start-progress")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async startProgress(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startProgress(id, req.user);
	}

	@Post(":id/await-info")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async awaitInfo(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.awaitInfo(id, req.user);
	}

	@Post(":id/start-treatment")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async startTreatment(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startTreatment(id, req.user);
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async resolve(
		@ClaimIdParam() id: ClaimId,
		@Body("resolution") resolution: string,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.resolve(id, req.user, resolution);
	}

	@Post(":id/close")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_CLOSE)
	@ClaimDetailResponse()
	async close(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.close(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async reject(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.reject(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async sendToDtm(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.sendToDtm(id, req.user);
	}
}
