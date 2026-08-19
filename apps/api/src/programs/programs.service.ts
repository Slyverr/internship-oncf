import { Permission, ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { PROGRAM_STATUSES } from "src/db/reference-data";
import { PROGRAM_STATUS_BY_ID, PROGRAM_TRANSITION } from "./programs.constants";
import { toCreate, toUpdate } from "./programs.mapper";
import {
	programDetailRelations,
	programListColumns,
	programListRelations,
} from "./programs.query";
import type { ProgramId } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";

@Injectable()
export class ProgramsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const values = toCreate(dto, user);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(forecastPrograms)
					.values(values)
					.returning({ id: forecastPrograms.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		const where = !hasOnePermission(user, Permission.PROGRAMS_MANAGE_OTHER)
			? { createdBy: user.id }
			: {};

		return this.drizzle.db.query.forecastPrograms.findMany({
			where,
			columns: programListColumns,
			with: programListRelations,
		});
	}

	async findOne(id: ProgramId) {
		const program = await this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			with: programDetailRelations,
		});

		if (!program) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return program;
	}

	async findOneForOwnership(id: ProgramId) {
		const program = await this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			columns: {
				id: true,
				createdBy: true,
			},
		});

		if (!program) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return program;
	}

	async findOneForTransition(id: ProgramId) {
		const program = await this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});

		if (!program) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return program;
	}

	async update(id: ProgramId, dto: UpdateProgramDto, user: AuthUser) {
		const values = toUpdate(dto, user);

		await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(forecastPrograms)
					.set(values)
					.where(eq(forecastPrograms.id, id)),
			values,
		);

		return this.findOne(id);
	}

	async transition(id: ProgramId, _user: AuthUser, toStatus: ProgramStatus) {
		const { statusId } = await this.findOneForTransition(id);

		const fromStatus = PROGRAM_STATUS_BY_ID[statusId];
		const allowed = PROGRAM_TRANSITION[fromStatus] ?? [];

		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(forecastPrograms)
					.set({
						statusId: PROGRAM_STATUSES[toStatus].id,
					})
					.where(eq(forecastPrograms.id, id)),
			{
				statusId: PROGRAM_STATUSES[toStatus].id,
			},
		);

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
		const [deleted] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.delete(forecastPrograms)
					.where(eq(forecastPrograms.id, id))
					.returning({ id: forecastPrograms.id }),
			{},
		);

		if (!deleted) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return deleted;
	}
}
