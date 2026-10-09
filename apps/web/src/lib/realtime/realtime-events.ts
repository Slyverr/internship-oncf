import type { QueryKey } from "@tanstack/react-query";
import { getDtmOperationsControllerListQueryKey } from "@/lib/api/dtm-operations";
import {
	getNotificationsControllerFindAllQueryKey,
	getNotificationsControllerGetUnreadCountQueryKey,
} from "@/lib/api/notifications";
import {
	getOrdersControllerFindAllQueryKey,
	getOrdersControllerFindOneQueryKey,
} from "@/lib/api/orders";
import {
	getProgramsControllerFindAllQueryKey,
	getProgramsControllerFindOneQueryKey,
} from "@/lib/api/programs";

export type RealtimeEventEnvelope = {
	id: string;
	type: string;
	occurredAt: string;
	data: Record<string, unknown>;
};

const eventInvalidationKeys: Record<string, QueryKey[]> = {
	"notifications.changed": [
		getNotificationsControllerFindAllQueryKey(),
		getNotificationsControllerGetUnreadCountQueryKey(),
	],
	"dtm.activity.changed": [getDtmOperationsControllerListQueryKey()],
	"orders.changed": [getOrdersControllerFindAllQueryKey()],
	"programs.changed": [getProgramsControllerFindAllQueryKey()],
};

export function getRealtimeInvalidationKeys(
	eventType: string,
	data: Record<string, unknown> = {},
): QueryKey[] {
	if (eventType === "realtime.resync") return getAllRealtimeInvalidationKeys();
	const keys = eventInvalidationKeys[eventType] ?? [];
	const id = data.code;
	if (typeof id !== "string") return keys;
	if (eventType === "orders.changed") {
		return [...keys, getOrdersControllerFindOneQueryKey(id)];
	}
	if (eventType === "programs.changed") {
		return [...keys, getProgramsControllerFindOneQueryKey(id)];
	}
	return keys;
}

export function getAllRealtimeInvalidationKeys(): QueryKey[] {
	return [...new Set(Object.values(eventInvalidationKeys).flat())];
}
