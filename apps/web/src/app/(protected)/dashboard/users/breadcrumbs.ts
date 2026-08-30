const users = {
	resource: "Users",
	baseUrl: "/dashboard/users",
};

export const usersBreadcrumbs = {
	home: () => [
		{
			label: users.resource,
			href: users.baseUrl,
		},
	],

	create: () => [
		...usersBreadcrumbs.home(),
		{
			label: "New User",
		},
	],

	detail: (id: string, label?: string) => [
		...usersBreadcrumbs.home(),
		{
			label: label ?? id,
			href: `${users.baseUrl}/${id}`,
		},
	],

	edit: (id: string, label?: string) => [
		...usersBreadcrumbs.detail(id, label),
		{
			label: "Edit",
		},
	],
};
