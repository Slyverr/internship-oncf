import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { PROGRAM_STATUSES, ProgramStatus } from "src/db/reference-data";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramId } from "./programs.types";

@Injectable()
export class ProgramsService {
	constructor(private drizzle: DrizzleService) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const programNumber = `PRG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const values = {
			...dto,
			programNumber,
			createdBy: user.id,
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
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

	async update(id: ProgramId, dto: UpdateProgramDto) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(forecastPrograms)
					.set(dto)
					.where(eq(forecastPrograms.id, id))
					.returning(),
			dto,
		);

		if (!updated) throw new NotFoundException(`Program ${id} not found`);
		return updated;
	}

	async approve(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId === PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id)
			throw new UnauthorizedException("Already sent to DTM");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: PROGRAM_STATUSES[ProgramStatus.APPROVED].id })
			.where(eq(forecastPrograms.id, id))
			.returning();

		return updated;
	}

	async reject(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId === PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id)
			throw new UnauthorizedException("Already sent to DTM");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: PROGRAM_STATUSES[ProgramStatus.CONFIRMED].id })
			.where(eq(forecastPrograms.id, id))
			.returning();

		return updated;
	}

	async sendToDtm(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId !== PROGRAM_STATUSES[ProgramStatus.APPROVED].id)
			throw new UnauthorizedException("Program must be approved first");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id })
			.where(eq(forecastPrograms.id, id))
			.returning();

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
}
