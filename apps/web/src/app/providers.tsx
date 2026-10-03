"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import type { AppLocale } from "@/i18n";
import { LocaleProvider } from "@/i18n/locale-provider";
import { shouldRetryApiRequest } from "@/lib/api-availability";
import { ApiRecoveryMonitor } from "@/providers/api-recovery-monitor";
import { AppearanceProvider } from "@/providers/appearance-provider";

const enableQueryDevtools =
	process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS === "true";

export function Providers({
	children,
	locale,
}: {
	children: React.ReactNode;
	locale: AppLocale;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: shouldRetryApiRequest,
						retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 5_000),
						refetchOnWindowFocus: true,
					},
				},
			}),
	);

	return (
		<LocaleProvider locale={locale}>
			<AppearanceProvider>
				<QueryClientProvider client={queryClient}>
					<ApiRecoveryMonitor />
					{children}
					{enableQueryDevtools && (
						<ReactQueryDevtools buttonPosition="bottom-right" />
					)}
				</QueryClientProvider>
			</AppearanceProvider>
		</LocaleProvider>
	);
}
