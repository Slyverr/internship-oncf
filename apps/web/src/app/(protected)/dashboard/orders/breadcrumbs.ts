import { Messages } from "@/i18n";
import { createEntityBreadcrumbs } from "@/lib/entity-breadcrumbs";

export const ordersBreadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.orders.pageTitle,
	baseUrl: "/dashboard/orders",
	createKey: Messages.orders.createForm.title,
	editKey: Messages.orders.actions.edit,
});
