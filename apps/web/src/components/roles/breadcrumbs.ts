import type { TypedMessageTranslator } from "@/i18n";
import { Messages } from "@/i18n";
import type { BreadcrumbItem } from "@/providers/breadcrumb-provider";

const baseUrl = "/dashboard/roles";

export function roleProfileCreateBreadcrumbs(
	t: TypedMessageTranslator,
): BreadcrumbItem[] {
	return [
		{ label: t(Messages.roleProfiles.pageTitle), href: baseUrl },
		{ label: t(Messages.roleProfiles.createTitle) },
	];
}

export function roleProfileEditBreadcrumbs(
	t: TypedMessageTranslator,
): BreadcrumbItem[] {
	return [
		{ label: t(Messages.roleProfiles.pageTitle), href: baseUrl },
		{ label: t(Messages.roleProfiles.editTitle) },
	];
}
