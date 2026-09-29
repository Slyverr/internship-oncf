import { OrderStatus, ProgramStatus } from "@ecommand/shared";
import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { canAccessCustomer } from "@/auth/customer-scope";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { NotificationsService } from "@/notifications/notifications.service";
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
		private readonly notifications: NotificationsService,
		private readonly programsQuery: ProgramsQuery,
		private readonly programsMapper: ProgramsMapper,
	) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const order = await this.programsQuery.findOrderCustomer(dto.orderId);
		if (!order) {
			throw new NotFoundException(`Order ${dto.orderId} not found`);
		}
		if (!canAccessCustomer(user, order.customerId)) {
			throw new ForbiddenException(
				"Cannot create programs for orders outside your assigned portfolio",
			);
		}
		if (
			![
				OrderStatus.APPROVED,
				OrderStatus.SENT_TO_DTM,
				OrderStatus.IN_PROGRESS,
			].includes(order.orderStatus?.name as OrderStatus)
		) {
			throw new ConflictException("Order is not eligible for program creation");
		}

		const existingProgram = await this.programsQuery.findProgramForOrder(
			dto.orderId,
		);
		if (existingProgram) {
			throw new ConflictException("This order already has a forecast program");
		}

		const values = this.programsMapper.toCreate(dto, user);
		const created = await this.programsQuery.createProgram(values, {
			userId: user.id,
			userName: user.email,
		});
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
		await this.programsQuery.updateProgram(id, values, undefined, {
			userId: user.id,
			userName: user.email,
		});
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

	async remove(id: ProgramId, user: AuthUser) {
		const program = await this.findOne(id);
		if (program.programStatus?.name !== ProgramStatus.DRAFT) {
			throw new ConflictException("Only draft programs can be deleted");
		}

		const deleted = await this.programsQuery.removeProgram(id, {
			userId: user.id,
			userName: user.email,
		});
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

		const updatedProgram = await this.programsQuery.updateProgram(
			id,
			{
				statusId: PROGRAM_STATUSES[toStatus].id,
			},
			and(
				eq(forecastPrograms.id, id),
				eq(forecastPrograms.statusId, program.statusId),
			),
			{ userId: user.id, userName: user.email },
		);
		if (!updatedProgram) {
			throw new ConflictException(
				`Program ${id} was modified or does not exist`,
			);
		}

		const updated = await this.findOne(id);
		await this.notifications.notifyChange(
			updated.createdByUserId,
			user.id,
			"programs",
			id,
			`Program #${id} is now ${toStatus.toLowerCase().replaceAll("_", " ")}.`,
		);
		return updated;
	}
}
