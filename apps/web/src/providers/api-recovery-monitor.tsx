"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { isApiUnavailableError } from "@/lib/api-availability";

export function ApiRecoveryMonitor() {
	const queryClient = useQueryClient();

	useEffect(() => {
		let recoveryNeeded = false;
		let probing = false;

		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (
				event.type === "updated" &&
				event.query.state.status === "error" &&
				isApiUnavailableError(event.query.state.error)
			) {
				recoveryNeeded = true;
			}
		});

		const checkApi = async () => {
			if (!recoveryNeeded || probing || document.visibilityState === "hidden")
				return;
			probing = true;
			try {
				const response = await fetch("/api/proxy/health", {
					cache: "no-store",
				});
				if (response.ok && recoveryNeeded) {
					recoveryNeeded = false;
					void queryClient.refetchQueries({
						type: "active",
						predicate: (query) => isApiUnavailableError(query.state.error),
					});
				}
			} catch {
				// A later successful probe retries active requests that failed while the API was down.
				recoveryNeeded = true;
			} finally {
				probing = false;
			}
		};

		const interval = window.setInterval(() => void checkApi(), 5_000);
		window.addEventListener("online", checkApi);
		document.addEventListener("visibilitychange", checkApi);

		return () => {
			window.clearInterval(interval);
			window.removeEventListener("online", checkApi);
			document.removeEventListener("visibilitychange", checkApi);
			unsubscribe();
		};
	}, [queryClient]);

	return null;
}
