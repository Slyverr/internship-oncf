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
import { RequireAny } from "src/auth/permissions.decorator";
import { createCrudResponses } from "src/common/decorators/api-crud-responses.decorator";
import { ProgramOwnershipGuard } from "./guards/program-ownership.guard";
import { ProgramIdPipe } from "./pipes/program-id.pipe";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";
import { ProgramDeleteDto } from "./responses/program-delete.dto";
import { ProgramDetailDto } from "./responses/program-detail.dto";
import { ProgramListDto } from "./responses/program-list.dto";

const ProgramIdParam = () => Param("id", ProgramIdPipe);

const {
	list: ProgramListResponse,
	create: ProgramCreateResponse,
	detail: ProgramDetailResponse,
	remove: ProgramDeleteResponse,
} = createCrudResponses({
	list: ProgramListDto,
	detail: ProgramDetailDto,
	remove: ProgramDeleteDto,
});

@Controller("programs")
@UseGuards(ProgramOwnershipGuard)
export class ProgramsController {
	constructor(private readonly programsService: ProgramsService) {}

	@Post()
	@RequireAny(Permission.PROGRAMS_CREATE)
	@ProgramCreateResponse()
	async create(@Body() dto: CreateProgramDto, @Request() req: AuthRequest) {
		return this.programsService.create(dto, req.user);
	}

	@Get()
	@RequireAny(Permission.PROGRAMS_READ)
	@ProgramListResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.programsService.findAll(req.user);
	}

	@Get(":id")
	@RequireAny(Permission.PROGRAMS_READ)
	@ProgramDetailResponse()
	async findOne(@ProgramIdParam() id: ProgramId) {
		return this.programsService.findOne(id);
	}

	@Patch(":id")
	@RequireAny(Permission.PROGRAMS_UPDATE)
	@ProgramDetailResponse()
	async update(
		@ProgramIdParam() id: ProgramId,
		@Body() dto: UpdateProgramDto,
		@Request() req: AuthRequest,
	) {
		return this.programsService.update(id, dto, req.user);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_APPROVE)
	@ProgramDetailResponse()
	async submit(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.submit(id, req.user);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_APPROVE)
	@ProgramDetailResponse()
	async approve(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.approve(id, req.user);
	}

	@Post(":id/confirm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_APPROVE)
	@ProgramDetailResponse()
	async confirm(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.confirm(id, req.user);
	}

	@Post(":id/send")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_SEND)
	@ProgramDetailResponse()
	async sendToDtm(
		@ProgramIdParam() id: ProgramId,
		@Request() req: AuthRequest,
	) {
		return this.programsService.sendToDtm(id, req.user);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_UPDATE)
	@ProgramDetailResponse()
	async cancel(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.cancel(id, req.user);
	}

	@Delete(":id")
	@RequireAny(Permission.PROGRAMS_DELETE)
	@ProgramDeleteResponse()
	async remove(@ProgramIdParam() id: ProgramId) {
		return this.programsService.remove(id);
	}
}
