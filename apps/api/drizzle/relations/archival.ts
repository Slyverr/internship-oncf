import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const archivalExecutionLogPart = defineRelationsPart(schema, (r) => ({
	archivalExecutionLog: {
		user: r.one.users({
			from: r.archivalExecutionLog.triggeredByUserId,
			to: r.users.id,
		}),
	},
}));

export const archivalRelations = {
	...archivalExecutionLogPart,
};
