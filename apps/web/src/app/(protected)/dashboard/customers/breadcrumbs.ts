import { Messages } from "@/i18n";
import { createEntityBreadcrumbs } from "@/lib/entity-breadcrumbs";

export const customersBreadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.customers.pageTitle,
	baseUrl: "/dashboard/customers",
	createKey: Messages.customers.createTitle,
	editKey: Messages.customers.detail.edit,
});
