import { ClaimStatus, Permission } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { claimComments, claimStatusHistory, claims } from "drizzle/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { DrizzleDb } from "src/db/drizzle.types";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { CLAIM_STATUSES } from "src/db/reference-data";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { toCreate, toUpdate } from "./claims.mapper";
import {
	claimDetailRelations,
	claimListColumns,
	claimListRelations,
} from "./claims.query";
import type { ClaimId, ClaimUpdate } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateClaimDto, user: AuthUser) {
		const values = toCreate(dto, user);

		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(claims)
					.values(values)
					.returning({ id: claims.id }),
			values,
		);

		return this.findOne(created.id);
	}

	async findAll(user: AuthUser) {
		const where = !hasOnePermission(user, Permission.CLAIMS_READ)
			? { createdByUserId: user.id }
			: {};

		return this.drizzle.db.query.claims.findMany({
			where,
			columns: claimListColumns,
			with: claimListRelations,
		});
	}

	async findOne(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
			with: claimDetailRelations,
		});

		return this.ensure(claim, id);
	}

	async findOneForOwnership(id: ClaimId) {
		const claim = await this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: { createdByUserId: true },
		});

		return this.ensure(claim, id);
	}

	async update(id: ClaimId, dto: UpdateClaimDto, user: AuthUser) {
		await this.persistUpdate(this.drizzle.db, id, toUpdate(dto, user), {
			history: {
				userId: user.id,
			},
		});

		return this.findOne(id);
	}

	async remove(id: ClaimId) {
		const [deleted] = await this.drizzle.db
			.delete(claims)
			.where(eq(claims.id, id))
			.returning({ id: claims.id });

		if (!deleted) {
			throw new NotFoundException(`Claim ${id} not found`);
		}

		return deleted;
	}

	async addComment(claimId: ClaimId, content: string, userId: number) {
		const [comment] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(claimComments)
					.values({ claimId, authorUserId: userId, comment: content })
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

		return this.transition(claimId, user.id, ClaimStatus.RESOLVED, undefined, {
			...(resolution ? { resolution } : {}),
		});
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

	private ensure<T>(value: T | undefined, id: ClaimId) {
		if (!value) {
			throw new NotFoundException(`Claim ${id} not found`);
		}

		return value;
	}

	private async persistUpdate(
		db: DrizzleDb,
		claimId: ClaimId,
		values: ClaimUpdate,
		options?: {
			where?: SQL;
			history?: {
				userId: number;
				comment?: string;
			};
		},
	) {
		const [updated] = await withDbErrorHandling(
			() =>
				db
					.update(claims)
					.set(values)
					.where(options?.where ?? eq(claims.id, claimId))
					.returning({ id: claims.id }),
			values,
		);

		if (!updated) {
			throw new ConflictException(
				`Claim ${claimId} was modified or does not exist`,
			);
		}

		if (values.statusId !== undefined && options?.history) {
			await db.insert(claimStatusHistory).values({
				claimId,
				statusId: values.statusId,
				changedByUserId: options.history.userId,
				comment: options.history.comment ?? null,
			});
		}

		return updated;
	}

	private async transition(
		claimId: ClaimId,
		userId: number,
		toStatus: ClaimStatus,
		comment?: string,
		extraValues: Partial<ClaimUpdate> = {},
	) {
		const { statusId: fromStatusId } = this.ensure(
			await this.drizzle.db.query.claims.findFirst({
				where: { id: claimId },
				columns: { statusId: true },
			}),
			claimId,
		);

		const fromStatus = CLAIM_STATUS_BY_ID[fromStatusId];

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

		await this.drizzle.db.transaction(async (tx) => {
			await this.persistUpdate(
				tx,
				claimId,
				{
					...extraValues,
					statusId: toStatusId,
				},
				{
					where: and(eq(claims.id, claimId), eq(claims.statusId, fromStatusId)),
					history: {
						userId,
						comment,
					},
				},
			);
		});

		return this.findOne(claimId);
	}
}
