import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Request,
} from "@nestjs/common";
import { Permissions } from "src/auth/permissions.decorator";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

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
	findOne(@Param("id") id: ProgramId) {
		return this.programsService.findOne(id);
	}

	@Patch(":id")
	@Permissions("programs:update")
	update(@Param("id") id: ProgramId, @Body() dto: UpdateProgramDto) {
		return this.programsService.update(id, dto);
	}

	@Patch(":id/approve")
	@Permissions("programs:approve")
	approve(@Param("id") id: ProgramId) {
		return this.programsService.approve(id);
	}

	@Patch(":id/reject")
	@Permissions("programs:approve")
	reject(@Param("id") id: ProgramId) {
		return this.programsService.reject(id);
	}

	@Patch(":id/send")
	@Permissions("programs:send")
	sendToDtm(@Param("id") id: ProgramId) {
		return this.programsService.sendToDtm(id);
	}

	@Delete(":id")
	@Permissions("programs:delete")
	remove(@Param("id") id: ProgramId) {
		return this.programsService.remove(id);
	}
}
