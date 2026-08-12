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
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramOwnershipGuard } from "./guards/program-ownership.guard";
import { ProgramIdPipe } from "./pipes/program-id.pipe";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

const ProgramIdParam = () => Param("id", ProgramIdPipe);

@Controller("programs")
@UseGuards(ProgramOwnershipGuard)
export class ProgramsController {
	constructor(private programsService: ProgramsService) {}

	@Post()
	@Permissions(Permission.PROGRAMS_CREATE)
	async create(@Body() dto: CreateProgramDto, @Request() req: AuthRequest) {
		return this.programsService.create(dto, req.user);
	}

	@Get()
	@Permissions(Permission.PROGRAMS_READ)
	async findAll() {
		return this.programsService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.PROGRAMS_READ)
	async findOne(@ProgramIdParam() id: ProgramId) {
		return this.programsService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.PROGRAMS_UPDATE)
	async update(
		@ProgramIdParam() id: ProgramId,
		@Body() dto: UpdateProgramDto,
		@Request() req: AuthRequest,
	) {
		return this.programsService.update(id, dto, req.user);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.PROGRAMS_APPROVE)
	async submit(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.submit(id, req.user);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.PROGRAMS_APPROVE)
	async approve(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.approve(id, req.user);
	}

	@Post(":id/confirm")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.PROGRAMS_APPROVE)
	async confirm(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.confirm(id, req.user);
	}

	@Post(":id/send")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.PROGRAMS_SEND)
	async sendToDtm(
		@ProgramIdParam() id: ProgramId,
		@Request() req: AuthRequest,
	) {
		return this.programsService.sendToDtm(id, req.user);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@Permissions(Permission.PROGRAMS_UPDATE)
	async cancel(@ProgramIdParam() id: ProgramId, @Request() req: AuthRequest) {
		return this.programsService.cancel(id, req.user);
	}

	@Delete(":id")
	@Permissions(Permission.PROGRAMS_DELETE)
	async remove(@ProgramIdParam() id: ProgramId) {
		return this.programsService.remove(id);
	}
}
