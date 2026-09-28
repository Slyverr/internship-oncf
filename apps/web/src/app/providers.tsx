"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AppearanceProvider } from "@/providers/appearance-provider";

const enableQueryDevtools =
	process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS === "true";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

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
