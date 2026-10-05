import { Permission } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import {
	claimComments,
	claimStatusHistory,
	claims,
	notifications,
} from "drizzle/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";

import type { NotificationInsert } from "@/notifications/notifications.types";
import type {
	ClaimId,
	ClaimInsert,
	ClaimNumber,
	ClaimUpdate,
} from "./claims.types";
import { ListClaimQueryDto } from "./requests/list-claim.dto";

type ClaimsColumns = QueryColumns<"claims">;
type ClaimsRelations = QueryRelations<"claims">;

const claimSortColumns = [
	"claimNumber",
	"priority",
	"createdAt",
	"updatedAt",
] as const;

const claimListColumns = {
	id: true,
	claimNumber: true,
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
		const [created] = await this.drizzle.db
			.insert(claims)
			.values(values)
			.returning({
				id: claims.id,
			});
		return created;
	}

	async findOrderCustomer(orderId: number) {
		return this.drizzle.db.query.orders.findFirst({
			where: { id: orderId },
			columns: { customerId: true },
		});
	}

	async findClaimAssociation(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: { customerId: true, orderId: true },
		});
	}

	async findClaims(query: ListClaimQueryDto, customerIds?: readonly number[]) {
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
		const scopedCustomerIds =
			customerIds === undefined
				? undefined
				: customerId === undefined
					? [...customerIds]
					: customerIds.includes(customerId)
						? [customerId]
						: [];

		return this.drizzle.db.query.claims.findMany({
			where: {
				...(scopedCustomerIds !== undefined
					? { customerId: { in: scopedCustomerIds } }
					: customerId !== undefined
						? { customerId }
						: {}),
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
						{ claimNumber: { ilike: `%${search}%` } },
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
				[claimSortColumns.includes(sortBy as (typeof claimSortColumns)[number])
					? sortBy
					: "createdAt"]: sortOrder,
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

	async findClaimByNumber(claimNumber: ClaimNumber) {
		return this.drizzle.db.query.claims.findFirst({
			where: { claimNumber },
			with: claimDetailRelations,
		});
	}

	async findClaimIdByNumber(claimNumber: ClaimNumber) {
		return this.drizzle.db.query.claims.findFirst({
			where: { claimNumber },
			columns: { id: true },
		});
	}

	async findClaimForOwnership(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: {
				claimNumber: true,
				createdByUserId: true,
				customerId: true,
			},
		});
	}

	async findClaimForOwnershipByNumber(claimNumber: ClaimNumber) {
		return this.drizzle.db.query.claims.findFirst({
			where: { claimNumber },
			columns: {
				claimNumber: true,
				createdByUserId: true,
				customerId: true,
			},
		});
	}

	async findClaimStatus(id: ClaimId) {
		return this.drizzle.db.query.claims.findFirst({
			where: { id },
			columns: {
				statusId: true,
				claimNumber: true,
				createdByUserId: true,
			},
		});
	}

	async findClaimReadersForCustomer(customerId: number) {
		const agents = await this.drizzle.db.query.users.findMany({
			where: {
				isActive: true,
				role: {
					rolePermissions: {
						permission: { name: Permission.CLAIMS_READ },
					},
				},
				userCustomers: { customerId },
			},
			columns: { id: true },
		});
		return agents.map(({ id }) => id);
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
			notification?: NotificationInsert;
		},
	) {
		const updated = await this.drizzle.db.transaction(async (tx) => {
			const [updatedClaim] = await tx
				.update(claims)
				.set(values)
				.where(options?.where ?? eq(claims.id, id))
				.returning({ id: claims.id });
			if (!updatedClaim) return undefined;

			if (values.statusId !== undefined && options?.history) {
				await tx.insert(claimStatusHistory).values({
					claimId: id,
					statusId: values.statusId,
					changedByUserId: options.history.userId,
					comment: options.history.comment ?? null,
				});
				if (options.notification) {
					await tx.insert(notifications).values(options.notification);
				}
			}
			return updatedClaim;
		});

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
				comment?: string;
			};
			notifications?: NotificationInsert[];
		},
	) {
		const [comment] = await this.drizzle.db.transaction(async (tx) => {
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
					})
					.where(and(eq(claims.id, claimId), eq(claims.statusId, fromStatusId)))
					.returning({ id: claims.id });

				if (updatedClaim) {
					await tx.insert(claimStatusHistory).values({
						claimId,
						statusId: toStatusId,
						changedByUserId,
						comment: comment ?? null,
					});
				}
			}

			if (options?.notifications?.length) {
				await tx.insert(notifications).values(options.notifications);
			}

			return [createdComment];
		});
		return comment;
	}

	async findClaimComments(claimId: ClaimId, commentId?: number) {
		return this.drizzle.db.query.claimComments.findMany({
			where: { claimId, ...(commentId !== undefined && { id: commentId }) },
			columns: {
				id: true,
				claimId: true,
				authorUserId: true,
				comment: true,
				createdAt: true,
			},
			with: {
				authorUser: {
					columns: {
						firstName: true,
						lastName: true,
					},
				},
			},
			orderBy: (comments, { asc }) => [asc(comments.createdAt)],
		});
	}
}
