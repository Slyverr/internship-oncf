"use client";

import { BreadcrumbTrail } from "@/components/common/breadcrumb-trail";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

export function WorkspaceBreadcrumbs() {
	const { breadcrumbs } = useBreadcrumbs();
	const showTrail = breadcrumbs.length > 1;

	return (
		<div className="-mb-4 min-h-6">
			{showTrail && (
				<div className="hidden sm:block">
					<BreadcrumbTrail items={breadcrumbs} />
				</div>
			)}
		</div>
	);
}
