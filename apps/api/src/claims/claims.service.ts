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
import { DrizzleService } from "@/database/drizzle.service";
import { CLAIM_STATUSES } from "@/database/reference-data";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { toCreate, toUpdate } from "./claims.mapper";
import {
	addClaimComment,
	createClaim,
	deleteClaim,
	findClaim,
	findClaimComments,
	findClaimForOwnership,
	findClaimStatus,
	findClaims,
	updateClaim,
} from "./claims.query";
import type { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateClaimDto, user: AuthUser) {
		const created = await createClaim(this.drizzle.db, toCreate(dto, user));

		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		const where = !hasOnePermission(user, Permission.CLAIMS_READ)
			? { createdByUserId: user.id }
			: {};

		return findClaims(this.drizzle.db, where);
	}

	async findOne(id: ClaimId) {
		return this.ensure(await findClaim(this.drizzle.db, id), id);
	}

	async findOneForOwnership(id: ClaimId) {
		return this.ensure(await findClaimForOwnership(this.drizzle.db, id), id);
	}

	async update(id: ClaimId, dto: UpdateClaimDto, user: AuthUser) {
		await this.persistUpdate(id, toUpdate(dto, user), {
			history: {
				userId: user.id,
			},
		});

		return this.findOne(id);
	}

	async remove(id: ClaimId) {
		const deleted = await deleteClaim(this.drizzle.db, id);
		return this.ensure(deleted, id);
	}

	async addComment(claimId: ClaimId, content: string, userId: number) {
		return addClaimComment(this.drizzle.db, claimId, content, userId);
	}

	async getComments(claimId: ClaimId) {
		return findClaimComments(this.drizzle.db, claimId);
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
			undefined,
			resolution ? { resolution } : {},
		);
	}

	async close(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.CLOSED, undefined, {
			closedByUserId: user.id,
			closedAt: new Date().toISOString(),
		});
	}

	async reject(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, user.id, ClaimStatus.REJECTED);
	}

	async sendToDtm(claimId: ClaimId, user: AuthUser) {
		const claim = await this.findOne(claimId);
		if (claim.statusId !== CLAIM_STATUSES[ClaimStatus.RESOLVED].id) {
			throw new ConflictException("Only resolved claims can be sent to DTM");
		}

		return this.transition(claimId, user.id, ClaimStatus.SENT_TO_DTM);
	}

	private async persistUpdate(
		id: ClaimId,
		values: Parameters<typeof updateClaim>[2],
		options?: Parameters<typeof updateClaim>[3],
	) {
		const updated = await updateClaim(this.drizzle.db, id, values, options);

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
			await findClaimStatus(this.drizzle.db, claimId),
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

	private ensure<T>(value: T | undefined, id: ClaimId) {
		if (!value) {
			throw new NotFoundException(`Claim ${id} not found`);
		}

		return value;
	}
}
