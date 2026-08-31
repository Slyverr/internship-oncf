const orders = {
	resource: "Orders",
	baseUrl: "/dashboard/orders",
};

export const ordersBreadcrumbs = {
	home: () => [
		{
			label: orders.resource,
			href: orders.baseUrl,
		},
	],

	create: () => [
		...ordersBreadcrumbs.home(),
		{
			label: "New Order",
		},
	],

	detail: (id: string, label?: string) => [
		...ordersBreadcrumbs.home(),
		{
			label: label ?? id,
			href: `${orders.baseUrl}/${id}`,
		},
	],

	edit: (id: string, label?: string) => [
		...ordersBreadcrumbs.detail(id, label),
		{
			label: "Edit",
		},
	],
};
