"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbContextType {
	breadcrumbs: BreadcrumbItem[];
	setBreadcrumbs: (...breadcrumbs: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

interface BreadcrumbProviderProps {
	prefix?: BreadcrumbItem[];
	children: ReactNode;
}

export function BreadcrumbProvider({
	prefix = [],
	children,
}: BreadcrumbProviderProps) {
	const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);

	const setBreadcrumbs = useCallback((...items: BreadcrumbItem[]) => {
		setBreadcrumbsState(items);
	}, []);

	const value = useMemo(
		() => ({
			breadcrumbs: [...prefix, ...breadcrumbs],
			setBreadcrumbs,
		}),
		[prefix, breadcrumbs, setBreadcrumbs],
	);

	return (
		<BreadcrumbContext.Provider value={value}>
			{children}
		</BreadcrumbContext.Provider>
	);
}

export function useBreadcrumbs() {
	const context = useContext(BreadcrumbContext);

	if (!context) {
		throw new Error("useBreadcrumbs must be used within BreadcrumbProvider");
	}

	return context;
}
