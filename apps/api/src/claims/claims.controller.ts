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
import { Permission } from "src/db/reference-data";
import { ClaimsService } from "./claims.service";
import type { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./dto/create-claim-dto";
import { UpdateClaimDto } from "./dto/update-claim-dto";
import { ClaimOwnershipGuard } from "./guards/claim-ownership.guard";
import { ClaimIdPipe } from "./pipes/claim-id.pipe";

const ClaimIdParam = () => Param("id", ClaimIdPipe);

@Controller("claims")
@UseGuards(ClaimOwnershipGuard)
export class ClaimsController {
	constructor(private readonly claimsService: ClaimsService) {}

	@Post()
	@Permissions(Permission.CLAIMS_CREATE)
	async create(@Body() dto: CreateClaimDto, @Request() req: AuthRequest) {
		return this.claimsService.create(dto, req.user);
	}

	@Get()
	@Permissions(Permission.CLAIMS_READ)
	async findAll(@Request() req: AuthRequest) {
		return this.claimsService.findAll(req.user);
	}

	@Get(":id")
	@Permissions(Permission.CLAIMS_READ)
	async findOne(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.CLAIMS_UPDATE)
	async update(
		@ClaimIdParam() id: ClaimId,
		@Body() dto: UpdateClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.update(id, dto, req.user);
	}

	@Delete(":id")
	@Permissions(Permission.CLAIMS_DELETE)
	async remove(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.remove(id);
	}

	@Post(":id/comments")
	@Permissions(Permission.CLAIMS_UPDATE)
	async addComment(
		@ClaimIdParam() id: ClaimId,
		@Body("content") content: string,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.addComment(id, content, req.user.id);
	}

	@Get(":id/comments")
	@Permissions(Permission.CLAIMS_READ)
	async getComments(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.getComments(id);
	}

	@Post(":id/start-progress")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	async startProgress(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startProgress(id, req.user);
	}

	@Post(":id/await-info")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	async awaitInfo(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.awaitInfo(id, req.user);
	}

	@Post(":id/start-treatment")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	async startTreatment(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startTreatment(id, req.user);
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
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
	async close(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.close(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	async reject(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.reject(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	async sendToDtm(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.sendToDtm(id, req.user);
	}
}
