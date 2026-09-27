"use client";

import { BreadcrumbTrail } from "@/components/common/breadcrumb-trail";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

export function WorkspaceBreadcrumbs() {
	const { breadcrumbs } = useBreadcrumbs();
	return <BreadcrumbTrail items={breadcrumbs} />;
}
