import { ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { PROGRAM_STATUS_BY_ID, PROGRAM_TRANSITION } from "./programs.constants";
import { ProgramsMapper } from "./programs.mapper";
import { ProgramsQuery } from "./programs.query";
import type { ProgramId } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { ListProgramQueryDto } from "./requests/list-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";

@Injectable()
export class ProgramsService {
	constructor(
		private readonly programsQuery: ProgramsQuery,
		private readonly programsMapper: ProgramsMapper,
	) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const values = this.programsMapper.toCreate(dto, user);
		const created = await this.programsQuery.createProgram(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: ListProgramQueryDto) {
		return this.programsQuery.findPrograms(user, query);
	}

	async findOne(id: ProgramId) {
		const program = await this.programsQuery.findProgram(id);
		return this.ensure(program, id);
	}

	async findOneForOwnership(id: ProgramId) {
		const program = await this.programsQuery.findProgramForOwnership(id);
		return this.ensure(program, id);
	}

	async update(id: ProgramId, dto: UpdateProgramDto, user: AuthUser) {
		const values = this.programsMapper.toUpdate(dto, user);
		await this.programsQuery.updateProgram(id, values);
		return this.findOne(id);
	}

	async submit(id: ProgramId, user: AuthUser) {
		return this.transition(id, user, ProgramStatus.PENDING_APPROVAL);
	}

	async approve(id: ProgramId, user: AuthUser) {
		return this.transition(id, user, ProgramStatus.APPROVED);
	}

	async confirm(id: ProgramId, user: AuthUser) {
		return this.transition(id, user, ProgramStatus.CONFIRMED);
	}

	async cancel(id: ProgramId, user: AuthUser) {
		return this.transition(id, user, ProgramStatus.CANCELLED);
	}

	async sendToDtm(id: ProgramId, user: AuthUser) {
		return this.transition(id, user, ProgramStatus.SENT_TO_DTM);
	}

	async remove(id: ProgramId) {
		const deleted = await this.programsQuery.removeProgram(id);
		return this.ensure(deleted, id);
	}

	private ensure<T>(program: T | undefined, id: ProgramId): T {
		if (!program) {
			throw new NotFoundException(`Program ${id} not found`);
		}
		return program;
	}

	private async transition(
		id: ProgramId,
		user: AuthUser,
		toStatus: ProgramStatus,
	) {
		const program = this.ensure(
			await this.programsQuery.findProgramStatus(id),
			id,
		);

		const fromStatus = PROGRAM_STATUS_BY_ID[program.statusId];
		if (!fromStatus) {
			throw new ConflictException(
				`Invalid status ${program.statusId} for program ${id}`,
			);
		}

		const allowed = PROGRAM_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		await this.programsQuery.updateProgram(
			id,
			{
				statusId: PROGRAM_STATUSES[toStatus].id,
			},
			and(
				eq(forecastPrograms.id, id),
				eq(forecastPrograms.statusId, program.statusId),
			),
		);

		return this.findOne(id);
	}
}
