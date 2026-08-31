const programs = {
	resource: "Programs",
	baseUrl: "/dashboard/programs",
};

export const programsBreadcrumbs = {
	home: () => [
		{
			label: programs.resource,
			href: programs.baseUrl,
		},
	],

	create: () => [
		...programsBreadcrumbs.home(),
		{
			label: "New Program",
		},
	],

	detail: (id: string, label?: string) => [
		...programsBreadcrumbs.home(),
		{
			label: label ?? id,
			href: `${programs.baseUrl}/${id}`,
		},
	],

	edit: (id: string, label?: string) => [
		...programsBreadcrumbs.detail(id, label),
		{
			label: "Edit",
		},
	],
};
