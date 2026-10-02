function normalizePermissionSearchText(value: string): string {
	return value
		.toLocaleLowerCase("en")
		.replace(/[-_:/.]+/g, " ")
		.trim()
		.replace(/\s+/g, " ");
}

export function filterPermissionsBySearch<
	T extends { name: string; description?: string },
>(permissions: T[], search: string): T[] {
	const query = normalizePermissionSearchText(search);
	if (!query) return permissions;
	const terms = query.split(" ");
	return permissions.filter((permission) => {
		const searchableText = normalizePermissionSearchText(
			`${permission.name} ${permission.description ?? ""}`,
		);
		return terms.every((term) => searchableText.includes(term));
	});
}
