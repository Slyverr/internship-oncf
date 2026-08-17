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
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import { MessageResponseDto } from "src/common/responses/message.dto";
import { ClaimsService } from "./claims.service";
import type { ClaimId } from "./claims.types";
import { CreateClaimResponseDto } from "./dto/create-claim.response.dto";
import { CreateClaimDto } from "./dto/create-claim-dto";
import { UpdateClaimResponseDto } from "./dto/update-claim.response.dto";
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
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	async create(@Body() dto: CreateClaimDto, @Request() req: AuthRequest) {
		return this.claimsService.create(dto, req.user);
	}

	@Get()
	@Permissions(Permission.CLAIMS_READ)
	@ApiOkResponse({ type: [CreateClaimResponseDto] })
	@ApiUnauthorizedResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.claimsService.findAll(req.user);
	}

	@Get(":id")
	@Permissions(Permission.CLAIMS_READ)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiNotFoundResponse()
	async findOne(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: UpdateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async update(
		@ClaimIdParam() id: ClaimId,
		@Body() dto: UpdateClaimDto,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.update(id, dto, req.user);
	}

	@Delete(":id")
	@Permissions(Permission.CLAIMS_DELETE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async remove(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.remove(id);
	}

	@Post(":id/comments")
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async addComment(
		@ClaimIdParam() id: ClaimId,
		@Body("content") content: string,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.addComment(id, content, req.user.id);
	}

	@Get(":id/comments")
	@Permissions(Permission.CLAIMS_READ)
	@ApiOkResponse({ type: [MessageResponseDto] })
	@ApiUnauthorizedResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async getComments(@ClaimIdParam() id: ClaimId) {
		return this.claimsService.getComments(id);
	}

	@Post(":id/start-progress")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async startProgress(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startProgress(id, req.user);
	}

	@Post(":id/await-info")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async awaitInfo(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.awaitInfo(id, req.user);
	}

	@Post(":id/start-treatment")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async startTreatment(
		@ClaimIdParam() id: ClaimId,
		@Request() req: AuthRequest,
	) {
		return this.claimsService.startTreatment(id, req.user);
	}

	@Post(":id/resolve")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
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
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async close(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.close(id, req.user);
	}

	@Post(":id/reject")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async reject(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.reject(id, req.user);
	}

	@Post(":id/send-to-dtm")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.CLAIMS_UPDATE)
	@ApiOkResponse({ type: CreateClaimResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async sendToDtm(@ClaimIdParam() id: ClaimId, @Request() req: AuthRequest) {
		return this.claimsService.sendToDtm(id, req.user);
	}
}
