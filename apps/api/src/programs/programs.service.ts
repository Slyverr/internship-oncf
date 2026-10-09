import {
	API_ERROR_CODES,
	NotificationMessageCode,
	OrderStatus,
	ProgramStatus,
} from "@ecommand/shared";
import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { forecastPrograms } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { canAccessCustomer } from "@/auth/customer-scope";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { DTM_GATEWAY, type DtmGateway } from "@/dtm/dtm.gateway";
import { NotificationsService } from "@/notifications/notifications.service";
import { PROGRAM_STATUS_BY_ID, PROGRAM_TRANSITION } from "./programs.constants";
import { ProgramsMapper } from "./programs.mapper";
import { ProgramsQuery } from "./programs.query";
import type {
	ProgramId,
	ProgramIdentifier,
	ProgramNumber,
} from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { ListProgramQueryDto } from "./requests/list-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";

@Injectable()
export class ProgramsService {
	constructor(
		private readonly notifications: NotificationsService,
		private readonly programsQuery: ProgramsQuery,
		private readonly programsMapper: ProgramsMapper,
		@Inject(DTM_GATEWAY) private readonly dtm: DtmGateway,
	) {}

	async create(dto: CreateProgramDto, user: AuthUser) {
		const order = await this.programsQuery.findOrderCustomer(dto.orderId);
		if (!order) {
			throw new NotFoundException({
				code: API_ERROR_CODES.ORDER_NOT_FOUND,
			});
		}
		if (!canAccessCustomer(user, order.customerId)) {
			throw new ForbiddenException({
				code: API_ERROR_CODES.PROGRAM_CUSTOMER_ACCESS_DENIED,
			});
		}
		if (
			![
				OrderStatus.APPROVED,
				OrderStatus.SENT_TO_DTM,
				OrderStatus.IN_PROGRESS,
			].includes(order.orderStatus?.name as OrderStatus)
		) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_NOT_ELIGIBLE_FOR_PROGRAM,
			});
		}

		const existingProgram = await this.programsQuery.findProgramForOrder(
			dto.orderId,
		);
		if (existingProgram) {
			throw new ConflictException({
				code: API_ERROR_CODES.ORDER_ALREADY_PROGRAMMED,
			});
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
		return this.ensure(program);
	}

	async findOneForOwnership(identifier: ProgramIdentifier) {
		const program =
			typeof identifier === "number"
				? await this.programsQuery.findProgramForOwnership(identifier)
				: await this.programsQuery.findProgramForOwnershipByNumber(identifier);
		return this.ensure(program);
	}

	async resolveProgramId(identifier: ProgramIdentifier): Promise<ProgramId> {
		if (typeof identifier === "number") return identifier;
		const program = await this.programsQuery.findProgramIdByNumber(
			identifier as ProgramNumber,
		);
		return this.ensure(program).id;
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
		const program = await this.transition(id, user, ProgramStatus.SENT_TO_DTM);
		await this.dtm.submitProgram(program, user);
		return this.findOne(id);
	}

	async remove(id: ProgramId, user: AuthUser) {
		const program = await this.findOne(id);
		if (program.programStatus?.name !== ProgramStatus.DRAFT) {
			throw new ConflictException({
				code: API_ERROR_CODES.PROGRAM_MUST_BE_DRAFT,
			});
		}

		const deleted = await this.programsQuery.removeProgram(id, {
			userId: user.id,
			userName: user.email,
		});
		return this.ensure(deleted);
	}

	private ensure<T>(program: T | undefined): T {
		if (!program) {
			throw new NotFoundException({
				code: API_ERROR_CODES.PROGRAM_NOT_FOUND,
			});
		}
		return program;
	}

	private async transition(
		id: ProgramId,
		user: AuthUser,
		toStatus: ProgramStatus,
	) {
		const program = this.ensure(await this.programsQuery.findProgramStatus(id));

		const fromStatus = PROGRAM_STATUS_BY_ID[program.statusId];
		if (!fromStatus) {
			throw new ConflictException({
				code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID,
			});
		}

		const allowed = PROGRAM_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException({
				code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID,
			});
		}

		const notification = this.notifications.createChangeRecord(
			program.createdByUserId,
			user.id,
			"programs",
			id,
			{
				code: NotificationMessageCode.PROGRAM_STATUS_CHANGED,
				parameters: { recordCode: program.programNumber, status: toStatus },
			},
		);
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
			notification,
		);
		if (!updatedProgram) {
			throw new ConflictException({
				code: API_ERROR_CODES.PROGRAM_TRANSITION_INVALID,
			});
		}
		if (notification) {
			this.notifications.publishCreatedForUser(
				notification.recipientUserId,
				notification,
			);
		}

		return this.findOne(id);
	}
}
