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
import { ProgramOwnershipGuard } from "./guards/program-ownership.guard";
import { ProgramNumberPipe } from "./pipes/program-number.pipe";
import { ProgramsService } from "./programs.service";
import type { ProgramNumber } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { ListProgramQueryDto } from "./requests/list-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";
import { ProgramDeleteDto } from "./responses/program-delete.dto";
import { ProgramDetailDto } from "./responses/program-detail.dto";
import { ProgramListDto } from "./responses/program-list.dto";

const ProgramNumberParam = () => ApiStringPathParam("id", ProgramNumberPipe);

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
	async findAll(
		@Request() req: AuthRequest,
		@Query() query: ListProgramQueryDto,
	) {
		return this.programsService.findAll(req.user, query);
	}

	@Get(":id")
	@RequireAny(Permission.PROGRAMS_READ)
	@ProgramDetailResponse()
	async findOne(@ProgramNumberParam() number: ProgramNumber) {
		return this.programsService.findOne(
			await this.programsService.resolveProgramId(number),
		);
	}

	@Patch(":id")
	@RequireAny(Permission.PROGRAMS_UPDATE)
	@ProgramDetailResponse()
	async update(
		@ProgramNumberParam() number: ProgramNumber,
		@Body() dto: UpdateProgramDto,
		@Request() req: AuthRequest,
	) {
		return this.programsService.update(
			await this.programsService.resolveProgramId(number),
			dto,
			req.user,
		);
	}

	@Post(":id/submit")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_ACTION_SUBMIT)
	@ProgramDetailResponse()
	async submit(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.submit(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}

	@Post(":id/approve")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_ACTION_APPROVE)
	@ProgramDetailResponse()
	async approve(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.approve(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}

	@Post(":id/confirm")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_ACTION_CONFIRM)
	@ProgramDetailResponse()
	async confirm(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.confirm(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}

	@Post(":id/send")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_ACTION_SEND)
	@ProgramDetailResponse()
	async sendToDtm(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.sendToDtm(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}

	@Post(":id/cancel")
	@HttpCode(HttpStatus.OK)
	@RequireAny(Permission.PROGRAMS_ACTION_CANCEL)
	@ProgramDetailResponse()
	async cancel(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.cancel(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}

	@Delete(":id")
	@RequireAny(Permission.PROGRAMS_DELETE)
	@ProgramDeleteResponse()
	async remove(
		@ProgramNumberParam() number: ProgramNumber,
		@Request() req: AuthRequest,
	) {
		return this.programsService.remove(
			await this.programsService.resolveProgramId(number),
			req.user,
		);
	}
}
