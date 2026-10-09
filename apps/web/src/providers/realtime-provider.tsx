"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getProfileControllerGetCurrentQueryOptions } from "@/lib/api/profile";
import {
	getAllRealtimeInvalidationKeys,
	getRealtimeInvalidationKeys,
	getRealtimeInvalidationPaths,
	getRealtimeServerRefreshPaths,
	type RealtimeEventEnvelope,
} from "@/lib/realtime/realtime-events";
import { getRealtimeToastPresentation } from "@/lib/realtime/realtime-toast";
import { useAuth } from "@/providers/auth-provider";

const RealtimeConnectionContext = createContext(false);

export function useRealtimeConnected() {
	return useContext(RealtimeConnectionContext);
}

function parseEvent(data: string): RealtimeEventEnvelope | null {
	try {
		const event = JSON.parse(data) as Partial<RealtimeEventEnvelope>;
		if (
			typeof event.type !== "string" ||
			typeof event.id !== "string" ||
			typeof event.occurredAt !== "string" ||
			typeof event.data !== "object" ||
			event.data === null
		) {
			return null;
		}
		return event as RealtimeEventEnvelope;
	} catch {
		return null;
	}
}

function invalidateRealtimePaths(
	queryClient: ReturnType<typeof useQueryClient>,
	paths: string[],
) {
	if (paths.length === 0) return;
	const prefixes = paths.map((path) => `${path}/`);
	void queryClient.invalidateQueries({
		predicate: ({ queryKey }) => {
			const key = queryKey[0];
			return (
				typeof key === "string" &&
				paths.some(
					(path, index) => key === path || key.startsWith(prefixes[index]),
				)
			);
		},
	});
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslate();
	const { setProfile } = useAuth();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		let source: EventSource | undefined;
		let disposed = false;
		const refreshCurrentServerPage = (eventType: string) => {
			if (
				getRealtimeServerRefreshPaths(eventType).includes(
					window.location.pathname,
				)
			) {
				router.refresh();
			}
		};
		const refreshCurrentProfile = () => {
			void queryClient
				.fetchQuery(getProfileControllerGetCurrentQueryOptions())
				.then(setProfile)
				.catch(() => undefined);
		};
		const connect = () => {
			if (disposed) return;
			if (source) {
				source.onopen = null;
				source.onmessage = null;
				source.onerror = null;
				source.close();
			}
			const currentSource = new EventSource("/api/proxy/realtime/events");
			source = currentSource;
			currentSource.onopen = () => {
				setConnected(true);
				for (const queryKey of getAllRealtimeInvalidationKeys()) {
					void queryClient.invalidateQueries({ queryKey });
				}
				invalidateRealtimePaths(
					queryClient,
					getRealtimeInvalidationPaths("realtime.resync"),
				);
				refreshCurrentServerPage("realtime.resync");
				refreshCurrentProfile();
			};
			currentSource.onmessage = (message) => {
				const event = parseEvent(message.data);
				if (!event || event.type === "realtime.heartbeat") return;

				for (const queryKey of getRealtimeInvalidationKeys(
					event.type,
					event.data,
				)) {
					void queryClient.invalidateQueries({ queryKey });
				}
				invalidateRealtimePaths(
					queryClient,
					getRealtimeInvalidationPaths(event.type),
				);
				refreshCurrentServerPage(event.type);
				if (
					event.type === "profile.changed" ||
					event.type === "customers.changed" ||
					event.type === "roles.changed"
				) {
					refreshCurrentProfile();
				}

				const reconnectForAuthorizationChange =
					event.type === "profile.changed" || event.type === "roles.changed";
				if (reconnectForAuthorizationChange) {
					// The API authorizes an SSE connection using the permissions loaded
					// when it opened. Reconnect so its stream filter uses current grants.
					setConnected(false);
				}

				const presentation = getRealtimeToastPresentation(event, locale);
				if (presentation) {
					toast.add({
						id: event.id,
						type: presentation.type,
						title: presentation.title,
						description: presentation.description,
						actionProps: {
							children: t(Messages.notifications.viewDetails),
							className:
								"border-0 bg-transparent px-1 shadow-none hover:bg-muted hover:underline",
							onClick: () => router.push(presentation.href),
						},
					});
				}
				if (reconnectForAuthorizationChange) connect();
			};
			currentSource.onerror = () => setConnected(false);
		};
		connect();

		return () => {
			disposed = true;
			source?.close();
			setConnected(false);
		};
	}, [queryClient, locale, router, setProfile, t]);

	return (
		<RealtimeConnectionContext.Provider value={connected}>
			{children}
		</RealtimeConnectionContext.Provider>
	);
}
