import { ClaimStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { claims } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { CLAIM_STATUSES } from "@/database/reference-data";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import type { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { ListClaimQueryDto } from "./requests/list-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	constructor(
		private readonly claimsQuery: ClaimsQuery,
		private readonly claimsMapper: ClaimsMapper,
	) {}

	async create(dto: CreateClaimDto, user: AuthUser) {
		const values = this.claimsMapper.toCreate(dto, user);
		const created = await this.claimsQuery.createClaim(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: ListClaimQueryDto) {
		const canManageOther = hasOnePermission(
			user,
			Permission.CLAIMS_MANAGE_OTHER,
		);

		if (!canManageOther) {
			if (query.userId !== user.id) {
				query.userId = user.id;
			}
			if (user.customerId && !query.customerId) {
				query.customerId = user.customerId;
			}
		}

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

		return this.claimsQuery.addClaimComment(claimId, content, user.id, {
			...(startsProgress && {
				statusTransition: {
					fromStatusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
					toStatusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
					changedByUserId: user.id,
					comment: "Claim moved to in progress after the first agent response.",
				},
			}),
		});
	}

	async getComments(claimId: ClaimId) {
		return this.claimsQuery.findClaimComments(claimId);
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

		return this.findOne(claimId);
	}

	private ensure<T>(value: T | undefined, id: ClaimId): T {
		if (!value) {
			throw new NotFoundException(`Claim ${id} not found`);
		}
		return value;
	}
}
