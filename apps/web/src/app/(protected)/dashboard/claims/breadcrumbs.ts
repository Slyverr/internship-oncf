const claims = {
	resource: "Claims",
	baseUrl: "/dashboard/claims",
};

export const claimsBreadcrumbs = {
	home: () => [
		{
			label: claims.resource,
			href: claims.baseUrl,
		},
	],

	create: () => [
		...claimsBreadcrumbs.home(),
		{
			label: "New Claim",
		},
	],

	detail: (id: string, label?: string) => [
		...claimsBreadcrumbs.home(),
		{
			label: label ?? id,
			href: `${claims.baseUrl}/${id}`,
		},
	],

	edit: (id: string, label?: string) => [
		...claimsBreadcrumbs.detail(id, label),
		{
			label: "Edit",
		},
	],
};
