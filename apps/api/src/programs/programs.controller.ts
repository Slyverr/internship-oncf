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
import { Permissions } from "src/auth/permissions.decorator";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

const ProgramIdParam = () => Param("id", ParseIntPipe);

@Controller("programs")
export class ProgramsController {
	constructor(private programsService: ProgramsService) {}

	@Post()
	@Permissions("programs:create")
	create(@Body() dto: CreateProgramDto, @Request() req) {
		return this.programsService.create(dto, req.user.id);
	}

	@Get()
	@Permissions("programs:read")
	findAll() {
		return this.programsService.findAll();
	}

	@Get(":id")
	@Permissions("programs:read")
	findOne(@ProgramIdParam() id: ProgramId) {
		return this.programsService.findOne(id);
	}

	@Patch(":id")
	@Permissions("programs:update")
	update(@ProgramIdParam() id: ProgramId, @Body() dto: UpdateProgramDto) {
		return this.programsService.update(id, dto);
	}

	@Patch(":id/approve")
	@Permissions("programs:approve")
	approve(@ProgramIdParam() id: ProgramId) {
		return this.programsService.approve(id);
	}

	@Patch(":id/reject")
	@Permissions("programs:approve")
	reject(@ProgramIdParam() id: ProgramId) {
		return this.programsService.reject(id);
	}

	@Patch(":id/send")
	@Permissions("programs:send")
	sendToDtm(@ProgramIdParam() id: ProgramId) {
		return this.programsService.sendToDtm(id);
	}

	@Delete(":id")
	@Permissions("programs:delete")
	remove(@ProgramIdParam() id: ProgramId) {
		return this.programsService.remove(id);
	}
}
