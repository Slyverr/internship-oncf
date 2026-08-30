const customers = {
	resource: "Customers",
	baseUrl: "/dashboard/customers",
};

export const customersBreadcrumbs = {
	home: () => [
		{
			label: customers.resource,
			href: customers.baseUrl,
		},
	],

	create: () => [
		...customersBreadcrumbs.home(),
		{
			label: "New Customer",
		},
	],

	detail: (id: string, label?: string) => [
		...customersBreadcrumbs.home(),
		{
			label: label ?? id,
			href: `${customers.baseUrl}/${id}`,
		},
	],

	edit: (id: string, label?: string) => [
		...customersBreadcrumbs.detail(id, label),
		{
			label: "Edit",
		},
	],
};
