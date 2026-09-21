import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const attachmentsPart = defineRelationsPart(schema, (r) => ({
	attachments: {
		orderFiles: r.many.orderFiles({
			from: r.attachments.id,
			to: r.orderFiles.attachmentId,
		}),
		claimFiles: r.many.claimFiles({
			from: r.attachments.id,
			to: r.claimFiles.attachmentId,
		}),
	},
}));

export const attachmentsRelations = {
	...attachmentsPart,
};
