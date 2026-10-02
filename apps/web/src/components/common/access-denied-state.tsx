import { Breadcrumbs } from "@/components/common/breadcrumbs";
import type { BreadcrumbItem } from "@/providers/breadcrumb-provider";
import { PageHeader } from "./page-header";

export function AccessDeniedState({
	title,
	description,
	breadcrumbs,
}: {
	title: string;
	description: string;
	breadcrumbs: BreadcrumbItem[];
}) {
	return (
		<>
			<Breadcrumbs items={breadcrumbs} />
			<PageHeader title={title} description={description} />
		</>
	);
}
