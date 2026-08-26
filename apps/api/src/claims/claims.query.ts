import { claimComments, claimStatusHistory, claims } from "drizzle/schema";
import { eq, type SQL } from "drizzle-orm";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
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

export async function createClaim(db: DrizzleDb, values: ClaimInsert) {
	const [created] = await withDbErrorHandling(
		() =>
			db.insert(claims).values(values).returning({
				id: claims.id,
			}),
		values,
	);

	return created;
}

export async function findClaims(db: DrizzleDb, query: ListClaimQueryDto) {
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

	return db.query.claims.findMany({
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

export async function findClaim(db: DrizzleDb, id: ClaimId) {
	return db.query.claims.findFirst({
		where: { id },
		with: claimDetailRelations,
	});
}

export async function findClaimForOwnership(db: DrizzleDb, id: ClaimId) {
	return db.query.claims.findFirst({
		where: { id },
		columns: {
			createdByUserId: true,
		},
	});
}

export async function findClaimStatus(db: DrizzleDb, id: ClaimId) {
	return db.query.claims.findFirst({
		where: { id },
		columns: {
			statusId: true,
		},
	});
}

export async function updateClaim(
	db: DrizzleDb,
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
			db
				.update(claims)
				.set(values)
				.where(options?.where ?? eq(claims.id, id))
				.returning({
					id: claims.id,
				}),
		values,
	);

	if (updated && values.statusId !== undefined && options?.history) {
		await db.insert(claimStatusHistory).values({
			claimId: id,
			statusId: values.statusId,
			changedByUserId: options.history.userId,
			comment: options.history.comment ?? null,
		});
	}

	return updated;
}

export async function deleteClaim(db: DrizzleDb, id: ClaimId) {
	const [deleted] = await db.delete(claims).where(eq(claims.id, id)).returning({
		id: claims.id,
	});

	return deleted;
}

export async function addClaimComment(
	db: DrizzleDb,
	claimId: ClaimId,
	content: string,
	userId: number,
) {
	const [comment] = await withDbErrorHandling(
		() =>
			db
				.insert(claimComments)
				.values({
					claimId,
					authorUserId: userId,
					comment: content,
				})
				.returning(),
		{
			claimId,
			content,
		},
	);

	return comment;
}

export async function findClaimComments(db: DrizzleDb, claimId: ClaimId) {
	return db.query.claimComments.findMany({
		where: { claimId },
		orderBy: (comments, { asc }) => [asc(comments.createdAt)],
	});
}
