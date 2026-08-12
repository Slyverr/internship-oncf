import { Permission, ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { PROGRAM_STATUSES } from "src/db/reference-data";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramId } from "./programs.types";

@Injectable()
export class ProgramsService {
	constructor(private drizzle: DrizzleService) {}

	private readonly PROGRAM_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> =
		{
			[ProgramStatus.DRAFT]: [
				ProgramStatus.PENDING_APPROVAL,
				ProgramStatus.CANCELLED,
			],
			[ProgramStatus.PENDING_APPROVAL]: [
				ProgramStatus.APPROVED,
				ProgramStatus.CONFIRMED,
			],
			[ProgramStatus.APPROVED]: [ProgramStatus.SENT_TO_DTM],
			[ProgramStatus.SENT_TO_DTM]: [ProgramStatus.IN_PROGRESS],
			[ProgramStatus.IN_PROGRESS]: [
				ProgramStatus.COMPLETED,
				ProgramStatus.CANCELLED,
			],
			[ProgramStatus.CONFIRMED]: [],
			[ProgramStatus.COMPLETED]: [],
			[ProgramStatus.CANCELLED]: [],
		};

	private normalizeCreate(dto: CreateProgramDto, user: AuthUser) {
		const userId = dto.userId ?? user.id;
		if (
			!hasPermission(user, Permission.ORDERS_MANAGE_USER) &&
			userId !== user.id
		) {
			throw new ForbiddenException("Cannot assign programs to other users");
		}

		const status = hasPermission(user, Permission.ORDERS_MANAGE_STATUS)
			? (dto.status ?? ProgramStatus.DRAFT)
			: ProgramStatus.DRAFT;

		return { ...dto, userId, statusId: PROGRAM_STATUSES[status].id };
	}

	private normalizeUpdate(dto: UpdateProgramDto, user: AuthUser) {
		if (dto.userId !== undefined && dto.userId !== user.id) {
			if (!hasPermission(user, Permission.ORDERS_MANAGE_USER)) {
				throw new ForbiddenException("Cannot assign programs to other users");
			}
		}

		const result: Partial<UpdateProgramDto> & { statusId?: number } = {
			...dto,
		};
		if (dto.status !== undefined) {
			if (!hasPermission(user, Permission.ORDERS_MANAGE_STATUS)) {
				throw new ForbiddenException("Cannot change program status");
			}
			result.statusId = PROGRAM_STATUSES[dto.status].id;
		}

		return result;
	}

	private async updateStatus(id: ProgramId, status: ProgramStatus) {
		const statusId = PROGRAM_STATUSES[status].id;
		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId })
			.where(eq(forecastPrograms.id, id))
			.returning();
		return updated;
	}

	private async transition(id: ProgramId, toStatus: ProgramStatus) {
		const program = await this.findOne(id);
		const fromName = Object.keys(PROGRAM_STATUSES).find(
			(key) => PROGRAM_STATUSES[key as ProgramStatus].id === program.statusId,
		) as ProgramStatus;

		if (!fromName) {
			throw new ConflictException(
				`Invalid status ${program.statusId} for program ${id}`,
			);
		}

		if (fromName === toStatus) {
			throw new ConflictException(`Program is already ${toStatus}`);
		}

		const allowed = this.PROGRAM_TRANSITIONS[fromName] || [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromName} to ${toStatus}`,
			);
		}

		return this.updateStatus(id, toStatus);
	}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const values = {
			...this.normalizeCreate(dto, user),
			programNumber: `PRG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			createdBy: user.id,
		};

		const [program] = await withDbErrorHandling(
			() => this.drizzle.db.insert(forecastPrograms).values(values).returning(),
			values,
		);
		return program;
	}

	async findAll() {
		return this.drizzle.db.query.forecastPrograms.findMany();
	}

	async findOne(id: ProgramId) {
		const program = await this.drizzle.db.query.forecastPrograms.findFirst({
			where: { id },
		});
		if (!program) throw new NotFoundException(`Program ${id} not found`);
		return program;
	}

	async update(id: ProgramId, dto: UpdateProgramDto, user: AuthUser) {
		const values = this.normalizeUpdate(dto, user);

		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(forecastPrograms)
					.set(values)
					.where(eq(forecastPrograms.id, id))
					.returning(),
			values,
		);

		if (!updated) throw new NotFoundException(`Program ${id} not found`);
		return updated;
	}

	async remove(id: ProgramId) {
		const [deleted] = await this.drizzle.db
			.delete(forecastPrograms)
			.where(eq(forecastPrograms.id, id))
			.returning();
		if (!deleted) throw new NotFoundException(`Program ${id} not found`);
		return deleted;
	}

	async submit(id: ProgramId, _user: AuthUser) {
		return this.transition(id, ProgramStatus.PENDING_APPROVAL);
	}

	async approve(id: ProgramId, _user: AuthUser) {
		return this.transition(id, ProgramStatus.APPROVED);
	}

	async confirm(id: ProgramId, _user: AuthUser) {
		return this.transition(id, ProgramStatus.CONFIRMED);
	}

	async cancel(id: ProgramId, _user: AuthUser) {
		return this.transition(id, ProgramStatus.CANCELLED);
	}

	async sendToDtm(id: ProgramId, _user: AuthUser) {
		return this.transition(id, ProgramStatus.SENT_TO_DTM);
	}
}
