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
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { ClaimsService } from "./claims.service";
import type { ClaimId } from "./claims.types";
import { ClaimOwnershipGuard } from "./guards/claim-ownership.guard";
import { ClaimIdPipe } from "./pipes/claim-id.pipe";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { ListClaimQueryDto } from "./requests/list-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";
import { ClaimCommentDto } from "./responses/claim-comment.dto";
import { ClaimDeleteDto } from "./responses/claim-delete.dto";
import { ClaimDetailDto } from "./responses/claim-detail.dto";
import { ClaimListDto } from "./responses/claim-list.dto";

const ClaimIdParam = () => Param("id", ClaimIdPipe);

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
	async findOne(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.findOne(id);
	}

	@Patch(":id")
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async update(
		@ClaimIdParam() id: ClaimId,
		@Body() dto: UpdateClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.update(id, dto, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.CLAIMS_DELETE)
	@ClaimDeleteResponse()
	async remove(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.remove(id);
	}

	@Post(":id/comments")
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimCommentResponse()
	async addComment(
		@ClaimIdParam() id: ClaimId,
		@Body("content") content: string,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.addComment(id, content, req.user.id);
	}

	@Get(":id/comments")
	@RequireAny(Permission.CLAIMS_READ)
	@ClaimCommentsResponse()
	async getComments(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.getComments(id);
	}

	@Post(":id/start-progress")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async startProgress(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startProgress(id, req.user);
	}

	@Post(":id/await-info")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async awaitInfo(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.awaitInfo(id, req.user);
	}

	@Post(":id/start-treatment")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async startTreatment(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startTreatment(id, req.user);
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
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
	@RequireAny(Permission.CLAIMS_CLOSE)
	@ClaimDetailResponse()
	async close(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.close(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async reject(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.reject(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.CLAIMS_UPDATE)
	@ClaimDetailResponse()
	async sendToDtm(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.sendToDtm(id, req.user);
	}
}
