import type { UserListDto } from "@/lib/api/generated.schemas";

export function getDashboardRoleCounts(users: Pick<UserListDto, "role">[]) {
	const counts = new Map<string, number>();

	for (const user of users) {
		counts.set(user.role.name, (counts.get(user.role.name) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
