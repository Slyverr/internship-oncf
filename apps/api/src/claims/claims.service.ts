import { ClaimStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { claimComments, claimStatusHistory, claims } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasAnyPermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { CLAIM_STATUSES } from "src/db/reference-data";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { toCreate, toUpdate } from "./claims.mapper";
import {
	claimDetailRelations,
	claimListColumns,
	claimListRelations,
} from "./claims.query";
import { ClaimId } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	constructor(private readonly drizzle: DrizzleService) {}

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
		const claim = await this.findOneForTransition(claimId);
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
		const toStatusId = CLAIM_STATUSES[toStatus].id;
		await this.recordHistory(claimId, toStatusId, userId, comment);

		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(claims)
					.set({ statusId: toStatusId })
					.where(eq(claims.id, claimId))
					.returning(),
			{ claimId },
		);
		return updated;
	}

	async create(dto: CreateClaimDto, user: AuthUser) {
		const values = toCreate(dto, user);
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(claims).values(values).returning(),
			values,
		);
		return created;
	}

	async findAll(user: AuthUser) {
		if (hasAnyPermission(user, Permission.CLAIMS_READ)) {
			return this.drizzle.db.query.claims.findMany({
				columns: claimListColumns,
				with: claimListRelations,
			});
		}
		return this.drizzle.db.query.claims.findMany({
			where: { userId: user.id },
			columns: claimListColumns,
			with: claimListRelations,
		});
	}

	async findOne(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
			with: claimDetailRelations,
		});
		if (!claim) throw new NotFoundException(`Claim ${id} not found`);
		return claim;
	}

	async findOneForOwnership(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: { userId: true, customerId: true },
		});
		if (!claim) throw new NotFoundException(`Claim ${id} not found`);
		return claim;
	}

	async findOneForTransition(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: { statusId: true },
		});
		if (!claim) throw new NotFoundException(`Claim ${id} not found`);
		return claim;
	}

	async update(id: ClaimId, dto: UpdateClaimDto, user: AuthUser) {
		const values = toUpdate(dto, user);
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
			.returning({ id: claims.id });

		return deleted;
	}

	async addComment(claimId: ClaimId, content: string, userId: number) {
		const [comment] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(claimComments)
					.values({ claimId, userId, comment: content })
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
			throw new ConflictException("Resolution required to resolve claim");
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
			throw new ConflictException("Only resolved claims can be closed");
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
			throw new ConflictException("Only resolved claims can be sent to DTM");
		}
		return this.transition(claimId, ClaimStatus.SENT_TO_DTM, user.id);
	}
}
