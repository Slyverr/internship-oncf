import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const dtmIntegrationLogPart = defineRelationsPart(schema, (r) => ({
	integrationCredentials: {
		createdByUser: r.one.users({
			from: r.integrationCredentials.createdByUserId,
			to: r.users.id,
		}),
		wagonTrackings: r.many.wagonTracking({
			from: r.integrationCredentials.id,
			to: r.wagonTracking.integrationCredentialId,
		}),
	},
	dtmIntegrationLog: {
		dtmRequestType: r.one.dtmRequestTypes({
			from: r.dtmIntegrationLog.requestTypeId,
			to: r.dtmRequestTypes.id,
		}),
		createdByUser: r.one.users({
			from: r.dtmIntegrationLog.createdByUserId,
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
