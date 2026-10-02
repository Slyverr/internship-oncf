import { Messages } from "@/i18n";
import { createEntityBreadcrumbs } from "@/lib/entity-breadcrumbs";

export const usersBreadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.users.pageTitle,
	baseUrl: "/dashboard/users",
	createKey: Messages.users.createTitle,
	editKey: Messages.users.actions.edit,
});
