import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ApiStringPathParam } from "@/common/decorators/api-path-param.decorator";
import { ClaimsService } from "./claims.service";
import type { ClaimNumber } from "./claims.types";
import { ClaimOwnershipGuard } from "./guards/claim-ownership.guard";
import { ClaimNumberPipe } from "./pipes/claim-number.pipe";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { CreateClaimCommentDto } from "./requests/create-claim-comment.dto";
import { ListClaimQueryDto } from "./requests/list-claim.dto";
import { RejectClaimDto } from "./requests/reject-claim.dto";
import { ResolveClaimDto } from "./requests/resolve-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";
import { ClaimCommentDto } from "./responses/claim-comment.dto";
import { ClaimDeleteDto } from "./responses/claim-delete.dto";
import { ClaimDetailDto } from "./responses/claim-detail.dto";
import { ClaimListDto } from "./responses/claim-list.dto";

const ClaimNumberParam = () => ApiStringPathParam("id", ClaimNumberPipe);

const {
	list: ClaimListResponse,
	detail: ClaimDetailResponse,
	create: ClaimCreateResponse,
	remove: ClaimDeleteResponse,
	comment: ClaimCommentResponse,
	comments: ClaimCommentsResponse,
} = createCrudResponses({
	list: ClaimListDto,
	detail: ClaimDetailDto,
	create: ClaimDetailDto,
	remove: ClaimDeleteDto,

	custom: {
		comment: {
			type: ClaimCommentDto,
			status: HttpStatus.OK,
			errors: [HttpStatus.UNAUTHORIZED],
		},
		comments: {
			type: [ClaimCommentDto],
			status: HttpStatus.OK,
			errors: [HttpStatus.UNAUTHORIZED],
		},
	},
});

@Controller("claims")
@UseGuards(ClaimOwnershipGuard)
export class ClaimsController {
	constructor(private readonly claimsService: ClaimsService) {}

	@Post()
	@RequireAny(Permission.CLAIMS_CREATE)
	@ClaimCreateResponse()
	async create(@Body() dto: CreateClaimDto, @Request() req: AuthRequest) {
		return this.claimsService.create(dto, req.user);
	}

	@Get()
	@RequireAny(Permission.CLAIMS_READ)
	@ClaimListResponse()
	async findAll(
		@Request() req: AuthRequest,
		@Query() query: ListClaimQueryDto,
	) {
		return this.claimsService.findAll(req.user, query);
	}

	@Get(":id")
	@RequireAny(Permission.CLAIMS_READ)
	@ClaimDetailResponse()
	async findOne(@ClaimNumberParam() id: ClaimNumber) {
		return this.claimsService.findOne(id);
	}

	@Patch(":id")
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async update(
		@ClaimNumberParam() id: ClaimNumber,
		@Body() dto: UpdateClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.update(id, dto, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.CLAIMS_DELETE)
	@ClaimDeleteResponse()
	async remove(@ClaimNumberParam() id: ClaimNumber) {
		return this.claimsService.remove(id);
	}

	@Post(":id/comments")
	@RequireAny(Permission.CLAIMS_ACTION_COMMENT)
	@ClaimCommentResponse()
	async addComment(
		@ClaimNumberParam() id: ClaimNumber,
		@Body() dto: CreateClaimCommentDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.addComment(id, dto.content, req.user);
	}

	@Get(":id/comments")
	@RequireAny(Permission.CLAIMS_READ)
	@ClaimCommentsResponse()
	async getComments(@ClaimNumberParam() id: ClaimNumber) {
		return this.claimsService.getComments(id);
	}

	@Post(":id/start-progress")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_START_PROGRESS)
	@ClaimDetailResponse()
	async startProgress(
		@ClaimNumberParam() id: ClaimNumber,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startProgress(id, req.user);
	}

	@Post(":id/await-info")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_AWAIT_INFO)
	@ClaimDetailResponse()
	async awaitInfo(
		@ClaimNumberParam() id: ClaimNumber,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.awaitInfo(id, req.user);
	}

	@Post(":id/start-treatment")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_START_TREATMENT)
	@ClaimDetailResponse()
	async startTreatment(
		@ClaimNumberParam() id: ClaimNumber,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startTreatment(id, req.user);
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_RESOLVE)
	@ClaimDetailResponse()
	async resolve(
		@ClaimNumberParam() id: ClaimNumber,
		@Body() dto: ResolveClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.resolve(id, req.user, dto.resolution);
	}

	@Post(":id/close")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_CLOSE)
	@ClaimDetailResponse()
	async close(
		@ClaimNumberParam() id: ClaimNumber,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.close(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_REJECT)
	@ClaimDetailResponse()
	async reject(
		@ClaimNumberParam() id: ClaimNumber,
		@Body() dto: RejectClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.reject(id, req.user, dto.rejectionReason);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_ACTION_SEND_TO_DTM)
	@ClaimDetailResponse()
	async sendToDtm(
		@ClaimNumberParam() id: ClaimNumber,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.sendToDtm(id, req.user);
	}
}
