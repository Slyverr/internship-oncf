import { Permission, ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { DrizzleDb } from "src/db/drizzle.types";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { PROGRAM_STATUSES } from "src/db/reference-data";
import { PROGRAM_STATUS_BY_ID, PROGRAM_TRANSITION } from "./programs.constants";
import { toCreate, toUpdate } from "./programs.mapper";
import {
	programDetailRelations,
	programListColumns,
	programListRelations,
} from "./programs.query";
import type { ProgramId, ProgramUpdate } from "./programs.types";
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
		const where = hasOnePermission(user, Permission.PROGRAMS_MANAGE_OTHER)
			? {}
			: { createdByUserId: user.id };

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

		return this.ensure(program, id);
	}

	async findOneForOwnership(id: ProgramId) {
		const program = await this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
			columns: { createdByUserId: true },
		});

		return this.ensure(program, id);
	}

	async update(id: ProgramId, dto: UpdateProgramDto, user: AuthUser) {
		await this.persistUpdate(this.drizzle.db, id, toUpdate(dto, user));

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
		const [deleted] = await this.drizzle.db
			.delete(forecastPrograms)
			.where(eq(forecastPrograms.id, id))
			.returning({ id: forecastPrograms.id });

		if (!deleted) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return deleted;
	}

	private ensure<T>(program: T | undefined, id: ProgramId) {
		if (!program) {
			throw new NotFoundException(`Program ${id} not found`);
		}

		return program;
	}

	private async persistUpdate(
		db: DrizzleDb,
		id: ProgramId,
		values: ProgramUpdate,
		where: SQL = eq(forecastPrograms.id, id),
	) {
		const [updated] = await withDbErrorHandling(
			() =>
				db
					.update(forecastPrograms)
					.set(values)
					.where(where)
					.returning({ id: forecastPrograms.id }),
			values,
		);

		if (!updated) {
			throw new ConflictException(
				`Program ${id} was modified or does not exist`,
			);
		}

		return updated;
	}

	private async transition(
		id: ProgramId,
		user: AuthUser,
		toStatus: ProgramStatus,
	) {
		const { statusId: fromStatusId } = this.ensure(
			await this.drizzle.db.query.forecastPrograms.findFirst({
				where: { id },
				columns: { statusId: true },
			}),
			id,
		);

		const fromStatus = PROGRAM_STATUS_BY_ID[fromStatusId];
		if (!fromStatus) {
			throw new ConflictException(
				`Invalid status ${fromStatusId} for program ${id}`,
			);
		}

		const allowed = PROGRAM_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		const statusId = PROGRAM_STATUSES[toStatus].id;

		await this.drizzle.db.transaction(async (tx) => {
			await this.persistUpdate(
				tx,
				id,
				{ statusId },
				and(
					eq(forecastPrograms.id, id),
					eq(forecastPrograms.statusId, fromStatusId),
				),
			);
		});

		return this.findOne(id);
	}
}
