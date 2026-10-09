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
	"orders.changed": [
		getOrdersControllerFindAllQueryKey(),
		["order-report"],
		["dashboard-order-activity"],
	],
	"programs.changed": [getProgramsControllerFindAllQueryKey()],
	"customers.changed": [["order-report"], ["dashboard-order-activity"]],
	"catalog.changed": [["active-reference-data"], ["managed-reference-data"]],
	"integration-credentials.changed": [["integration-credentials"]],
};

const eventInvalidationPaths: Record<string, string[]> = {
	"orders.changed": ["/orders"],
	"programs.changed": ["/programs"],
	"claims.changed": ["/claims"],
	"tracking.changed": ["/tracking"],
	"catalog.changed": ["/catalog"],
	"customers.changed": [
		"/customers",
		"/orders",
		"/programs",
		"/claims",
		"/users",
	],
	"users.changed": ["/users"],
	"roles.changed": ["/roles", "/users"],
	"integration-credentials.changed": ["/integration-credentials"],
	"profile.changed": ["/profile"],
	"profile.preferences.changed": ["/profile/preferences"],
};

const eventServerRefreshPaths: Record<string, string[]> = {
	"orders.changed": ["/dashboard/orders"],
	"programs.changed": ["/dashboard/programs"],
	"claims.changed": ["/dashboard/claims"],
	"customers.changed": [
		"/dashboard/customers",
		"/dashboard/orders",
		"/dashboard/programs",
		"/dashboard/claims",
		"/dashboard/users",
	],
	"users.changed": ["/dashboard/users"],
	"roles.changed": ["/dashboard/roles", "/dashboard/users"],
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

export function getRealtimeInvalidationPaths(eventType: string): string[] {
	if (eventType === "realtime.resync") {
		return [...new Set(Object.values(eventInvalidationPaths).flat())];
	}
	return eventInvalidationPaths[eventType] ?? [];
}

export function getRealtimeServerRefreshPaths(eventType: string): string[] {
	if (eventType === "realtime.resync") {
		return [...new Set(Object.values(eventServerRefreshPaths).flat())];
	}
	return eventServerRefreshPaths[eventType] ?? [];
}
