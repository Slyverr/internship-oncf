import { QueryColumns, QueryRelations } from "src/db/drizzle.types";

type ClaimsColumns = QueryColumns<"claims">;
type ClaimsRelations = QueryRelations<"claims">;

export const claimListColumns = {
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

export const claimListRelations = {
	customer: { columns: { id: true, companyName: true } },
	createdByUser: { columns: { id: true, firstName: true, lastName: true } },
	order: { columns: { id: true, orderNumber: true } },
	accessoryOperation: { columns: { id: true, name: true } },
	claimType: { columns: { id: true, name: true } },
	claimStatus: { columns: { id: true, name: true } },
} satisfies ClaimsRelations;

export const claimDetailRelations = {
	...claimListRelations,
	closedByUser: { columns: { id: true, firstName: true, lastName: true } },
	claimStatusHistories: true,
	claimComments: true,
} satisfies ClaimsRelations;
