import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
} from "@nestjs/common";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import { Permission } from "src/db/reference-data";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

const ProgramIdParam = () => Param("id", ParseIntPipe);

@Controller("programs")
export class ProgramsController {
	constructor(private programsService: ProgramsService) {}

	@Post()
	@Permissions(Permission.PROGRAMS_CREATE)
	create(@Body() dto: CreateProgramDto, @Request() req: AuthRequest) {
		return this.programsService.create(dto, req.user);
	}

	@Get()
	@Permissions(Permission.PROGRAMS_READ)
	findAll() {
		return this.programsService.findAll();
	}

	@Get(":id")
	@Permissions(Permission.PROGRAMS_READ)
	findOne(@ProgramIdParam() id: ProgramId) {
		return this.programsService.findOne(id);
	}

	@Patch(":id")
	@Permissions(Permission.PROGRAMS_UPDATE)
	update(@ProgramIdParam() id: ProgramId, @Body() dto: UpdateProgramDto) {
		return this.programsService.update(id, dto);
	}

	@Patch(":id/approve")
	@Permissions(Permission.PROGRAMS_APPROVE)
	approve(@ProgramIdParam() id: ProgramId) {
		return this.programsService.approve(id);
	}

	@Patch(":id/reject")
	@Permissions(Permission.PROGRAMS_APPROVE)
	reject(@ProgramIdParam() id: ProgramId) {
		return this.programsService.reject(id);
	}

	@Patch(":id/send")
	@Permissions(Permission.PROGRAMS_SEND)
	sendToDtm(@ProgramIdParam() id: ProgramId) {
		return this.programsService.sendToDtm(id);
	}

	@Delete(":id")
	@Permissions(Permission.PROGRAMS_DELETE)
	remove(@ProgramIdParam() id: ProgramId) {
		return this.programsService.remove(id);
	}
}
