import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const notificationsPart = defineRelationsPart(schema, (r) => ({
	notifications: {
		recipientUser: r.one.users({
			from: r.notifications.recipientUserId,
			to: r.users.id,
		}),
		notificationType: r.one.notificationTypes({
			from: r.notifications.typeId,
			to: r.notificationTypes.id,
		}),
		notificationChannel: r.one.notificationChannels({
			from: r.notifications.channelId,
			to: r.notificationChannels.id,
		}),
	},
}));

const notificationTypesPart = defineRelationsPart(schema, (r) => ({
	notificationTypes: {
		notifications: r.many.notifications({
			from: r.notificationTypes.id,
			to: r.notifications.typeId,
		}),
	},
}));

const notificationChannelsPart = defineRelationsPart(schema, (r) => ({
	notificationChannels: {
		notifications: r.many.notifications({
			from: r.notificationChannels.id,
			to: r.notifications.channelId,
		}),
	},
}));

export const notificationsRelations = {
	...notificationsPart,
	...notificationTypesPart,
	...notificationChannelsPart,
};
