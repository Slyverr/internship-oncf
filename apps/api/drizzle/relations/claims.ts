import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const claimsPart = defineRelationsPart(schema, (r) => ({
	claims: {
		claimFiles: r.many.claimFiles({
			from: r.claims.id,
			to: r.claimFiles.claimId,
		}),
		customer: r.one.customers({
			from: r.claims.customerId,
			to: r.customers.id,
		}),
		createdByUser: r.one.users({
			from: r.claims.createdByUserId,
			to: r.users.id,
			alias: "claims_createdByUser",
		}),
		order: r.one.orders({
			from: r.claims.orderId,
			to: r.orders.id,
		}),
		accessoryOperation: r.one.accessoryOperations({
			from: r.claims.operationId,
			to: r.accessoryOperations.id,
		}),
		claimType: r.one.claimTypes({
			from: r.claims.typeId,
			to: r.claimTypes.id,
		}),
		claimStatus: r.one.claimStatus({
			from: r.claims.statusId,
			to: r.claimStatus.id,
		}),
		closedByUser: r.one.users({
			from: r.claims.closedByUserId,
			to: r.users.id,
			alias: "claims_closedByUser",
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.claims.id,
			to: r.claimStatusHistory.claimId,
		}),
		claimComments: r.many.claimComments({
			from: r.claims.id,
			to: r.claimComments.claimId,
		}),
	},
}));

const claimTypesPart = defineRelationsPart(schema, (r) => ({
	claimTypes: {
		claims: r.many.claims({
			from: r.claimTypes.id,
			to: r.claims.typeId,
		}),
	},
}));

const claimStatusPart = defineRelationsPart(schema, (r) => ({
	claimStatus: {
		claims: r.many.claims({
			from: r.claimStatus.id,
			to: r.claims.statusId,
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.claimStatus.id,
			to: r.claimStatusHistory.statusId,
		}),
	},
}));

const claimStatusHistoryPart = defineRelationsPart(schema, (r) => ({
	claimStatusHistory: {
		claim: r.one.claims({
			from: r.claimStatusHistory.claimId,
			to: r.claims.id,
		}),
		claimStatus: r.one.claimStatus({
			from: r.claimStatusHistory.statusId,
			to: r.claimStatus.id,
		}),
		changedByUser: r.one.users({
			from: r.claimStatusHistory.changedByUserId,
			to: r.users.id,
		}),
	},
}));

const claimCommentsPart = defineRelationsPart(schema, (r) => ({
	claimComments: {
		claim: r.one.claims({
			from: r.claimComments.claimId,
			to: r.claims.id,
		}),
		authorUser: r.one.users({
			from: r.claimComments.authorUserId,
			to: r.users.id,
		}),
	},
}));

const claimFilesPart = defineRelationsPart(schema, (r) => ({
	claimFiles: {
		claim: r.one.claims({
			from: r.claimFiles.claimId,
			to: r.claims.id,
		}),
		uploadedByUser: r.one.users({
			from: r.claimFiles.uploadedByUserId,
			to: r.users.id,
		}),
	},
}));

export const claimsRelations = {
	...claimsPart,
	...claimTypesPart,
	...claimStatusPart,
	...claimStatusHistoryPart,
	...claimCommentsPart,
	...claimFilesPart,
};
