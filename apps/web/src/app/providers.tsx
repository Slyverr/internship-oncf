"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppearanceProvider } from "@/providers/appearance-provider";

const queryClient = new QueryClient();
const enableQueryDevtools =
	process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS === "true";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AppearanceProvider>
			<QueryClientProvider client={queryClient}>
				{children}
				{enableQueryDevtools && (
					<ReactQueryDevtools buttonPosition="bottom-right" />
				)}
			</QueryClientProvider>
		</AppearanceProvider>
	);
}
