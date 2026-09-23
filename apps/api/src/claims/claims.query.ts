import { Injectable } from "@nestjs/common";
import { claimComments, claimStatusHistory, claims } from "drizzle/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { ClaimId, ClaimInsert, ClaimUpdate } from "./claims.types";
import { ListClaimQueryDto } from "./requests/list-claim.dto";

type ClaimsColumns = QueryColumns<"claims">;
type ClaimsRelations = QueryRelations<"claims">;

const claimListColumns = {
	id: true,
	customerId: true,
	createdByUserId: true,
	orderId: true,
	operationId: true,
	typeId: true,
	statusId: true,
	priority: true,
	description: true,
	resolution: true,
	closedByUserId: true,
	closedAt: true,
	createdAt: true,
	updatedAt: true,
} satisfies ClaimsColumns;

const claimListRelations = {
	customer: { columns: { id: true, companyName: true } },
	createdByUser: { columns: { id: true, firstName: true, lastName: true } },
	order: { columns: { id: true, orderNumber: true } },
	accessoryOperation: { columns: { id: true, name: true } },
	claimType: { columns: { id: true, name: true } },
	claimStatus: { columns: { id: true, name: true } },
} satisfies ClaimsRelations;

const claimDetailRelations = {
	...claimListRelations,
	closedByUser: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
	claimStatusHistories: true,
	claimComments: true,
} satisfies ClaimsRelations;

@Injectable()
export class ClaimsQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createClaim(values: ClaimInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(claims).values(values).returning({
					id: claims.id,
				}),
			values,
		);
		return created;
	}

	async findClaims(query: ListClaimQueryDto) {
		const {
			page = 1,
			limit = 20,
			search,
			customerId,
			userId: createdByUserId,
			orderId,
			operationId,
			type,
			status,
			priority,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = query;

		return this.drizzle.db.query.claims.findMany({
			where: {
				...(customerId !== undefined && { customerId }),
				...(createdByUserId !== undefined && { createdByUserId }),
				...(operationId !== undefined && { operationId }),
				...(orderId !== undefined && { orderId }),

				...(type && {
					claimType: {
						name: type,
					},
				}),

				...(status && {
					claimStatus: {
						name: status,
					},
				}),

				...(priority && { priority }),

				...(search && {
					OR: [
						{
							description: {
								ilike: `%${search}%`,
							},
						},
						{
							resolution: {
								ilike: `%${search}%`,
							},
						},
						{
							customer: {
								companyName: {
									ilike: `%${search}%`,
								},
							},
						},
						{
							claimStatus: {
								name: {
									ilike: `%${search}%`,
								},
							},
						},
						{
							claimType: {
								name: {
									ilike: `%${search}%`,
								},
							},
						},
					],
				}),
			},

			columns: claimListColumns,
			with: claimListRelations,

			orderBy: {
				[sortBy]: sortOrder,
			},

			limit,
			offset: (page - 1) * limit,
		});
	}

	async findClaim(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			with: claimDetailRelations,
		});
	}

	async findClaimForOwnership(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: {
				createdByUserId: true,
			},
		});
	}

	async findClaimStatus(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: {
				statusId: true,
			},
		});
	}

	async updateClaim(
		id: ClaimId,
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
				this.drizzle.db
					.update(claims)
					.set(values)
					.where(options?.where ?? eq(claims.id, id))
					.returning({
						id: claims.id,
					}),
			values,
		);

		if (updated && values.statusId !== undefined && options?.history) {
			await this.drizzle.db.insert(claimStatusHistory).values({
				claimId: id,
				statusId: values.statusId,
				changedByUserId: options.history.userId,
				comment: options.history.comment ?? null,
			});
		}

		return updated;
	}

	async deleteClaim(id: ClaimId) {
		const [deleted] = await this.drizzle.db
			.delete(claims)
			.where(eq(claims.id, id))
			.returning({
				id: claims.id,
			});
		return deleted;
	}

	async addClaimComment(
		claimId: ClaimId,
		content: string,
		userId: number,
		options?: {
			statusTransition?: {
				fromStatusId: string;
				toStatusId: string;
				changedByUserId: number;
				comment: string;
			};
		},
	) {
		const [comment] = await withDbErrorHandling(
			() =>
				this.drizzle.db.transaction(async (tx) => {
					const [createdComment] = await tx
						.insert(claimComments)
						.values({
							claimId,
							authorUserId: userId,
							comment: content,
						})
						.returning();

					if (options?.statusTransition) {
						const { fromStatusId, toStatusId, changedByUserId, comment } =
							options.statusTransition;
						const [updatedClaim] = await tx
							.update(claims)
							.set({
								statusId: toStatusId,
								updatedAt: new Date().toISOString(),
							})
							.where(
								and(eq(claims.id, claimId), eq(claims.statusId, fromStatusId)),
							)
							.returning({ id: claims.id });

						if (updatedClaim) {
							await tx.insert(claimStatusHistory).values({
								claimId,
								statusId: toStatusId,
								changedByUserId,
								comment,
							});
						}
					}

					return [createdComment];
				}),
			{
				claimId,
				content,
			},
		);
		return comment;
	}

	async findClaimComments(claimId: ClaimId) {
		return this.drizzle.db.query.claimComments.findMany({
			where: { claimId },
			orderBy: (comments, { asc }) => [asc(comments.createdAt)],
		});
	}
}
