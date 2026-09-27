"use client";

import { usePathname, useRouter } from "next/navigation";
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
				sortBy === column && sortOrder === "asc" ? "desc" : "asc";
			const params = new URLSearchParams(window.location.search);
			params.set("sortBy", column);
			params.set("sortOrder", nextOrder);
			const query = params.toString();

			router.replace(`${pathname}?${query}`, { scroll: false });
		},
		[pathname, router, sortBy, sortOrder],
	);

	return { searchValue, setSearchValue, updateQuery, updateSort };
}
