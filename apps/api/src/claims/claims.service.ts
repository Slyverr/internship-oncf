import { ClaimStatus, Permission, Role } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { claims } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { CLAIM_STATUSES } from "@/database/reference-data";
import { NotificationsService } from "@/notifications/notifications.service";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import type { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { ListClaimQueryDto } from "./requests/list-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	private readonly logger = new Logger(ClaimsService.name);

	constructor(
		private readonly notifications: NotificationsService,
		private readonly claimsQuery: ClaimsQuery,
		private readonly claimsMapper: ClaimsMapper,
	) {}

	async create(dto: CreateClaimDto, user: AuthUser) {
		await this.ensureOrderCustomer(dto.customerId, dto.orderId);
		const values = this.claimsMapper.toCreate(dto, user);
		const created = await this.claimsQuery.createClaim(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: ListClaimQueryDto) {
		if (hasOnePermission(user, Permission.CLAIMS_MANAGE_OTHER)) {
			return this.claimsQuery.findClaims(query);
		}

		if (user.role === Role.CLIENT_REPRESENTATIVE && user.customerId !== null) {
			query.userId = user.id;
			query.customerId = user.customerId;
			return this.claimsQuery.findClaims(query);
		}

		const customerScope = getCustomerScope(user);
		if (customerScope !== null) {
			return this.claimsQuery.findClaims(query, customerScope);
		}

		query.userId = user.id;
		return this.claimsQuery.findClaims(query);
	}

	async findOne(id: ClaimId) {
		const claim = await this.claimsQuery.findClaim(id);
		return this.ensure(claim, id);
	}

	async findOneForOwnership(id: ClaimId) {
		const claim = await this.claimsQuery.findClaimForOwnership(id);
		return this.ensure(claim, id);
	}

	async update(id: ClaimId, dto: UpdateClaimDto, user: AuthUser) {
		const values = this.claimsMapper.toUpdate(dto, user);
		if (dto.customerId !== undefined || dto.orderId !== undefined) {
			const claim = this.ensure(
				await this.claimsQuery.findClaimAssociation(id),
				id,
			);
			await this.ensureOrderCustomer(
				dto.customerId ?? claim.customerId,
				dto.orderId ?? claim.orderId ?? undefined,
			);
		}
		await this.persistUpdate(id, values, {
			history: {
				userId: user.id,
			},
		});
		return this.findOne(id);
	}

	async remove(id: ClaimId) {
		const deleted = await this.claimsQuery.deleteClaim(id);
		return this.ensure(deleted, id);
	}

	async addComment(claimId: ClaimId, content: string, user: AuthUser) {
		const startsProgress = hasOnePermission(
			user,
			Permission.CLAIMS_ACTION_START_PROGRESS,
		);

		const comment = await this.claimsQuery.addClaimComment(
			claimId,
			content,
			user.id,
			{
				...(startsProgress && {
					statusTransition: {
						fromStatusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
						toStatusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
						changedByUserId: user.id,
						comment:
							"Claim moved to in progress after the first agent response.",
					},
				}),
			},
		);
		const [created] = await this.getComments(claimId, comment.id);
		if (!created) throw new NotFoundException("Comment no longer exists");
		const claim = await this.findOneForOwnership(claimId);
		const recipients = new Set<number>();
		if (claim.createdByUserId !== user.id) {
			recipients.add(claim.createdByUserId);
		}

		if (user.role !== Role.AGENT_COMMERCIAL) {
			try {
				for (const agentId of await this.claimsQuery.findCommercialAgentIds(
					claim.customerId,
				)) {
					if (agentId !== user.id) recipients.add(agentId);
				}
			} catch (error) {
				this.logger.error(
					`Could not find commercial agents to notify about claim #${claimId}`,
					error instanceof Error ? error.stack : String(error),
				);
			}
		}

		await Promise.all(
			[...recipients].map((recipientId) =>
				this.notifications.notifyChange(
					recipientId,
					user.id,
					"claims",
					claimId,
					`A new comment was added to claim #${claimId}.`,
				),
			),
		);
		return created;
	}

	async getComments(claimId: ClaimId, commentId?: number) {
		const comments = await this.claimsQuery.findClaimComments(
			claimId,
			commentId,
		);
		return comments.map(({ authorUser, ...comment }) => ({
			...comment,
			authorName: authorUser
				? `${authorUser.firstName} ${authorUser.lastName}`
				: "Former user",
		}));
	}

	async startProgress(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.IN_PROGRESS);
	}

	async awaitInfo(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.AWAITING_INFO);
	}

	async startTreatment(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.IN_TREATMENT);
	}

	async resolve(claimId: ClaimId, user: AuthUser, resolution?: string) {
		const claim = await this.findOne(claimId);
		if (!resolution && !claim.resolution) {
			throw new ConflictException("Resolution required to resolve claim");
		}

		return this.transition(
			claimId,
			user.id,
			ClaimStatus.RESOLVED,
			resolution,
			resolution ? { resolution } : {},
		);
	}

	async close(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.CLOSED, undefined, {
			closedByUserId: user.id,
			closedAt: new Date().toISOString(),
		});
	}

	async reject(claimId: ClaimId, user: AuthUser, rejectionReason?: string) {
		return this.transition(
			claimId,
			user.id,
			ClaimStatus.REJECTED,
			rejectionReason,
		);
	}

	async sendToDtm(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.SENT_TO_DTM);
	}

	private async persistUpdate(
		id: ClaimId,
		values: Parameters<ClaimsQuery["updateClaim"]>[1],
		options?: Parameters<ClaimsQuery["updateClaim"]>[2],
	) {
		const updated = await this.claimsQuery.updateClaim(id, values, options);
		if (!updated) {
			throw new ConflictException(`Claim ${id} was modified or does not exist`);
		}
		return updated;
	}

	private async ensureOrderCustomer(
		customerId: number,
		orderId?: number | null,
	) {
		if (orderId === undefined || orderId === null) return;

		const order = await this.claimsQuery.findOrderCustomer(orderId);
		if (!order || order.customerId !== customerId) {
			throw new BadRequestException(
				"The associated order must belong to the selected customer.",
			);
		}
	}

	private async transition(
		claimId: ClaimId,
		userId: number,
		toStatus: ClaimStatus,
		comment?: string,
		extraValues: Record<string, unknown> = {},
	) {
		const claim = this.ensure(
			await this.claimsQuery.findClaimStatus(claimId),
			claimId,
		);

		const fromStatus = CLAIM_STATUS_BY_ID[claim.statusId];
		if (!fromStatus) {
			throw new BadRequestException(`Invalid status for claim ${claimId}`);
		}

		if (fromStatus === toStatus) {
			throw new ConflictException(`Claim is already ${toStatus}`);
		}

		const allowed = CLAIM_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		await this.persistUpdate(
			claimId,
			{
				...extraValues,
				statusId: CLAIM_STATUSES[toStatus].id,
			},
			{
				where: and(eq(claims.id, claimId), eq(claims.statusId, claim.statusId)),
				history: {
					userId,
					comment,
				},
			},
		);

		const updated = await this.findOne(claimId);
		await this.notifications.notifyChange(
			updated.createdByUserId,
			userId,
			"claims",
			claimId,
			`Claim #${claimId} is now ${toStatus.toLowerCase().replaceAll("_", " ")}.`,
		);
		return updated;
	}

	private ensure<T>(value: T | undefined, id: ClaimId): T {
		if (!value) {
			throw new NotFoundException(`Claim ${id} not found`);
		}
		return value;
	}
}
