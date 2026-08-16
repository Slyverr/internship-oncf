import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const dtmIntegrationLogPart = defineRelationsPart(schema, (r) => ({
	dtmIntegrationLog: {
		dtmRequestType: r.one.dtmRequestTypes({
			from: r.dtmIntegrationLog.requestTypeId,
			to: r.dtmRequestTypes.id,
		}),
		user: r.one.users({
			from: r.dtmIntegrationLog.createdBy,
			to: r.users.id,
		}),
	},
}));

const dtmRequestTypesPart = defineRelationsPart(schema, (r) => ({
	dtmRequestTypes: {
		dtmIntegrationLogs: r.many.dtmIntegrationLog({
			from: r.dtmRequestTypes.id,
			to: r.dtmIntegrationLog.requestTypeId,
		}),
	},
}));

export const integrationRelations = {
	...dtmIntegrationLogPart,
	...dtmRequestTypesPart,
};
