import { ClaimStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { claimComments, claimStatusHistory, claims } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { CLAIM_STATUSES, CLAIM_TYPES } from "src/db/reference-data";
import { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./dto/create-claim-dto";
import { UpdateClaimDto } from "./dto/update-claim-dto";

@Injectable()
export class ClaimsService {
	constructor(private readonly drizzle: DrizzleService) {}

	private readonly allowedTransitions: Record<ClaimStatus, ClaimStatus[]> = {
		[ClaimStatus.NEW]: [ClaimStatus.IN_PROGRESS, ClaimStatus.REJECTED],
		[ClaimStatus.IN_PROGRESS]: [
			ClaimStatus.AWAITING_INFO,
			ClaimStatus.IN_TREATMENT,
		],
		[ClaimStatus.AWAITING_INFO]: [
			ClaimStatus.IN_PROGRESS,
			ClaimStatus.IN_TREATMENT,
		],
		[ClaimStatus.IN_TREATMENT]: [ClaimStatus.RESOLVED, ClaimStatus.REJECTED],
		[ClaimStatus.RESOLVED]: [ClaimStatus.CLOSED, ClaimStatus.SENT_TO_DTM],
		[ClaimStatus.CLOSED]: [],
		[ClaimStatus.REJECTED]: [],
		[ClaimStatus.SENT_TO_DTM]: [],
	};

	private normalizeCreate(dto: CreateClaimDto, user: AuthUser) {
		const userId = dto.userId ?? user.id;

		if (!hasPermission(user, Permission.CLAIMS_CREATE) && userId !== user.id) {
			throw new ForbiddenException("Cannot create claims for other users");
		}

		const status = hasPermission(user, Permission.CLAIMS_UPDATE)
			? (dto.status ?? ClaimStatus.NEW)
			: ClaimStatus.NEW;

		return {
			...dto,
			userId,
			typeId: CLAIM_TYPES[dto.type].id,
			statusId: CLAIM_STATUSES[status].id,
		};
	}

	private normalizeUpdate(dto: UpdateClaimDto, user: AuthUser) {
		const result = { ...dto };

		if (dto.userId !== undefined && dto.userId !== user.id) {
			if (!hasPermission(user, Permission.CLAIMS_UPDATE))
				throw new ForbiddenException("Cannot assign claims to other users");

			result.userId = dto.userId;
		}

		if (dto.type !== undefined) {
			if (!hasPermission(user, Permission.CLAIMS_UPDATE))
				throw new ForbiddenException("Cannot change claim type");

			result["typeId"] = CLAIM_TYPES[dto.type].id;
		}

		if (dto.status !== undefined) {
			if (!hasPermission(user, Permission.CLAIMS_UPDATE))
				throw new ForbiddenException("Cannot change claim status");

			result["statusId"] = CLAIM_STATUSES[dto.status].id;
		}

		return result;
	}

	private async recordHistory(
		claimId: ClaimId,
		statusId: number,
		userId: number,
		comment?: string,
	) {
		await this.drizzle.db.insert(claimStatusHistory).values({
			claimId,
			statusId,
			changedBy: userId,
			comment: comment ?? null,
		});
	}

	private async transition(
		claimId: ClaimId,
		toStatus: ClaimStatus,
		userId: number,
		comment?: string,
	) {
		const claim = await this.findOne(claimId);
		const fromStatus = Object.keys(CLAIM_STATUSES).find(
			(key) => CLAIM_STATUSES[key as ClaimStatus].id === claim.statusId,
		) as ClaimStatus;

		if (!fromStatus) {
			throw new BadRequestException(`Invalid status for claim ${claimId}`);
		}

		if (fromStatus === toStatus) {
			throw new ConflictException(`Claim is already ${toStatus}`);
		}

		const allowed = this.allowedTransitions[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new BadRequestException(
				`Cannot transition from ${fromStatus} to ${toStatus}`,
			);
		}

		const toStatusId = CLAIM_STATUSES[toStatus].id;
		await this.recordHistory(claimId, toStatusId, userId, comment);

		const [updated] = await this.drizzle.db
			.update(claims)
			.set({ statusId: toStatusId })
			.where(eq(claims.id, claimId))
			.returning();

		return updated;
	}

	async create(dto: CreateClaimDto, user: AuthUser) {
		const values = this.normalizeCreate(dto, user);
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(claims).values(values).returning(),
			values,
		);
		return created;
	}

	async findAll(user: AuthUser) {
		if (hasPermission(user, Permission.CLAIMS_READ)) {
			return this.drizzle.db.query.claims.findMany();
		}
		return this.drizzle.db.query.claims.findMany({
			where: { userId: user.id },
		});
	}

	async findOne(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
		});
		if (!claim) throw new NotFoundException(`Claim ${id} not found`);
		return claim;
	}

	async update(id: ClaimId, dto: UpdateClaimDto, user: AuthUser) {
		const values = this.normalizeUpdate(dto, user);
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(claims)
					.set(values)
					.where(eq(claims.id, id))
					.returning(),
			values,
		);
		if (!updated) throw new NotFoundException(`Claim ${id} not found`);
		return updated;
	}

	async remove(id: ClaimId) {
		const [deleted] = await this.drizzle.db
			.delete(claims)
			.where(eq(claims.id, id))
			.returning();
		if (!deleted) throw new NotFoundException(`Claim ${id} not found`);
		return deleted;
	}

	async addComment(claimId: ClaimId, content: string, userId: number) {
		const [comment] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(claimComments)
					.values({
						claimId,
						userId,
						comment: content,
					})
					.returning(),
			{ claimId, content },
		);
		return comment;
	}

	async getComments(claimId: ClaimId) {
		return this.drizzle.db.query.claimComments.findMany({
			where: { claimId },
			orderBy: (comments, { asc }) => [asc(comments.createdAt)],
		});
	}

	async startProgress(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, ClaimStatus.IN_PROGRESS, user.id);
	}

	async awaitInfo(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, ClaimStatus.AWAITING_INFO, user.id);
	}

	async startTreatment(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, ClaimStatus.IN_TREATMENT, user.id);
	}

	async resolve(claimId: ClaimId, user: AuthUser, resolution?: string) {
		const claim = await this.findOne(claimId);
		if (!resolution && !claim.resolution) {
			throw new BadRequestException("Resolution required to resolve claim");
		}
		const result = await this.transition(
			claimId,
			ClaimStatus.RESOLVED,
			user.id,
		);
		if (resolution) {
			await this.drizzle.db
				.update(claims)
				.set({ resolution })
				.where(eq(claims.id, claimId));
		}
		return result;
	}

	async close(claimId: ClaimId, user: AuthUser) {
		const claim = await this.findOne(claimId);
		if (claim.statusId !== CLAIM_STATUSES[ClaimStatus.RESOLVED].id) {
			throw new BadRequestException("Only resolved claims can be closed");
		}
		const result = await this.transition(claimId, ClaimStatus.CLOSED, user.id);
		await this.drizzle.db
			.update(claims)
			.set({ closedBy: user.id, closedAt: new Date().toISOString() })
			.where(eq(claims.id, claimId));
		return result;
	}

	async reject(claimId: ClaimId, user: AuthUser) {
		return this.transition(claimId, ClaimStatus.REJECTED, user.id);
	}

	async sendToDtm(claimId: ClaimId, user: AuthUser) {
		const claim = await this.findOne(claimId);
		if (claim.statusId !== CLAIM_STATUSES[ClaimStatus.RESOLVED].id) {
			throw new BadRequestException("Only resolved claims can be sent to DTM");
		}
		return this.transition(claimId, ClaimStatus.SENT_TO_DTM, user.id);
	}
}
