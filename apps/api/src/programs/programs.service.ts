import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { OrdersService } from "src/orders/orders.service";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramId } from "./programs.types";

@Injectable()
export class ProgramsService {
	constructor(
		private drizzle: DrizzleService,
		private ordersService: OrdersService,
	) {}

	async create(dto: CreateProgramDto, userId: number) {
		const exists = await this.ordersService.exists(dto.orderId);
		if (!exists)
			throw new UnprocessableEntityException(`Order ${dto.orderId} not found`);

		const programNumber = `PRG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const [program] = await this.drizzle.db
			.insert(forecastPrograms)
			.values({
				orderId: dto.orderId,
				plannedDate: dto.plannedDate,
				quantityPlanned: dto.quantityPlanned,
				quantityRealized: dto.quantityRealized,
				dtmStatus: dto.dtmStatus,
				statusId: 1,
				createdBy: userId,
				programNumber,
			})
			.returning();

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
		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set(dto) // works directly
			.where(eq(forecastPrograms.id, id))
			.returning();

		if (!updated) throw new NotFoundException(`Program ${id} not found`);
		return updated;
	}

	async approve(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId === 4)
			throw new UnauthorizedException("Already sent to DTM");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: 3 })
			.where(eq(forecastPrograms.id, id))
			.returning();

		return updated;
	}

	async reject(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId === 4)
			throw new UnauthorizedException("Already sent to DTM");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: 5 })
			.where(eq(forecastPrograms.id, id))
			.returning();

		return updated;
	}

	async sendToDtm(id: ProgramId) {
		const program = await this.findOne(id);
		if (program.statusId !== 3)
			throw new UnauthorizedException("Program must be approved first");

		const [updated] = await this.drizzle.db
			.update(forecastPrograms)
			.set({ statusId: 4 })
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
