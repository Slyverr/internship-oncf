"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface UseTableQueryStateOptions {
	search: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export function useTableQueryState({
	search,
	sortBy,
	sortOrder,
}: UseTableQueryStateOptions) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeSortBy = searchParams.get("sortBy") ?? sortBy;
	const querySortOrder = searchParams.get("sortOrder");
	const activeSortOrder =
		querySortOrder === "asc" || querySortOrder === "desc"
			? querySortOrder
			: sortOrder;
	const [searchValue, setSearchValue] = useState(search);
	const debouncedSearch = useDebounce(searchValue);

	useEffect(() => {
		setSearchValue(search);
	}, [search]);

	const updateQuery = useCallback(
		(key: string, value?: string) => {
			const params = new URLSearchParams(window.location.search);
			const nextValue = value && value !== "ALL" ? value : undefined;

			if (params.get(key) === nextValue) return;

			if (nextValue) {
				params.set(key, nextValue);
			} else {
				params.delete(key);
			}

			const query = params.toString();
			router.replace(`${pathname}${query ? `?${query}` : ""}`, {
				scroll: false,
			});
		},
		[pathname, router],
	);

	useEffect(() => {
		updateQuery("search", debouncedSearch);
	}, [debouncedSearch, updateQuery]);

	const updateSort = useCallback(
		(column: string) => {
			const nextOrder =
				activeSortBy === column && activeSortOrder === "asc" ? "desc" : "asc";
			const params = new URLSearchParams(window.location.search);
			params.set("sortBy", column);
			params.set("sortOrder", nextOrder);
			const query = params.toString();

			router.replace(`${pathname}?${query}`, { scroll: false });
		},
		[pathname, router, activeSortBy, activeSortOrder],
	);

	return {
		searchValue,
		setSearchValue,
		updateQuery,
		updateSort,
		sortBy: activeSortBy,
		sortOrder: activeSortOrder,
	};
}
