import { Messages } from "@/i18n";
import { createEntityBreadcrumbs } from "@/lib/entity-breadcrumbs";

export const programsBreadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.programs.pageTitle,
	baseUrl: "/dashboard/programs",
	createKey: Messages.programs.createTitle,
	editKey: Messages.programs.actions.edit,
});
