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

export function getDashboardRegistrationCounts(
	users: Pick<UserListDto, "createdAt">[],
	now = new Date(),
) {
	const firstMonth = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
	);
	const end = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
	);
	const counts = new Map<string, number>();

	for (const user of users) {
		const createdAt = new Date(user.createdAt);
		if (createdAt < firstMonth || createdAt >= end) continue;
		const month = createdAt.toISOString().slice(0, 7);
		counts.set(month, (counts.get(month) ?? 0) + 1);
	}

	return Array.from({ length: 6 }, (_, index) => {
		const month = new Date(
			Date.UTC(
				firstMonth.getUTCFullYear(),
				firstMonth.getUTCMonth() + index,
				1,
			),
		);
		const key = month.toISOString().slice(0, 7);
		return { key, count: counts.get(key) ?? 0 };
	});
}
