"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	getAllRealtimeInvalidationKeys,
	getRealtimeInvalidationKeys,
	type RealtimeEventEnvelope,
} from "@/lib/realtime/realtime-events";
import { getRealtimeToastPresentation } from "@/lib/realtime/realtime-toast";

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

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslate();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const source = new EventSource("/api/proxy/realtime/events");
		source.onopen = () => {
			setConnected(true);
			for (const queryKey of getAllRealtimeInvalidationKeys()) {
				void queryClient.invalidateQueries({ queryKey });
			}
		};
		source.onmessage = (message) => {
			const event = parseEvent(message.data);
			if (!event || event.type === "realtime.heartbeat") return;

			for (const queryKey of getRealtimeInvalidationKeys(
				event.type,
				event.data,
			)) {
				void queryClient.invalidateQueries({ queryKey });
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
		};
		source.onerror = () => setConnected(false);

		return () => {
			source.close();
			setConnected(false);
		};
	}, [queryClient, locale, router, t]);

	return (
		<RealtimeConnectionContext.Provider value={connected}>
			{children}
		</RealtimeConnectionContext.Provider>
	);
}
