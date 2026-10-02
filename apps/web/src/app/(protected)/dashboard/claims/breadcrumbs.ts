import { Messages } from "@/i18n";
import { createEntityBreadcrumbs } from "@/lib/entity-breadcrumbs";

export const claimsBreadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.claims.title,
	baseUrl: "/dashboard/claims",
	createKey: Messages.claims.newTitle,
	editKey: Messages.claims.edit.breadcrumb,
});
