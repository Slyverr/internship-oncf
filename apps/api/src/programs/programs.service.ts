import { ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { DrizzleService } from "@/database/drizzle.service";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { PROGRAM_STATUS_BY_ID, PROGRAM_TRANSITION } from "./programs.constants";
import { toCreate, toUpdate } from "./programs.mapper";
import {
	createProgram,
	findProgram,
	findProgramForOwnership,
	findProgramStatus,
	findPrograms,
	removeProgram,
	updateProgram,
} from "./programs.query";
import type { ProgramId } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { ListProgramQueryDto } from "./requests/list-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";

@Injectable()
export class ProgramsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const created = await createProgram(this.drizzle.db, toCreate(dto, user));
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: ListProgramQueryDto) {
		return findPrograms(this.drizzle.db, user, query);
	}

	async findOne(id: ProgramId) {
		return this.ensure(await findProgram(this.drizzle.db, id), id);
	}

	async findOneForOwnership(id: ProgramId) {
		return this.ensure(await findProgramForOwnership(this.drizzle.db, id), id);
	}

	async update(id: ProgramId, dto: UpdateProgramDto, user: AuthUser) {
		await updateProgram(this.drizzle.db, id, toUpdate(dto, user));

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
		const deleted = await removeProgram(this.drizzle.db, id);
		return this.ensure(deleted, id);
	}

	private ensure<T>(program: T | undefined, id: ProgramId) {
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
			await findProgramStatus(this.drizzle.db, id),
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

		await updateProgram(
			this.drizzle.db,
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
