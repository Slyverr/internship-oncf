"use client";

import { useEffect } from "react";
import type { BreadcrumbItem } from "@/providers/breadcrumb-provider";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(...items);
	}, [items, setBreadcrumbs]);

	return null;
}
