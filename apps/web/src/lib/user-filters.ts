import type { RegistrationStatus } from "@ecommand/shared";
import type { UserListDto } from "@/lib/api/generated.schemas";

export interface UserFilters {
	registrationStatus?: RegistrationStatus;
	role?: string;
	activeStatus?: "ACTIVE" | "INACTIVE";
	search?: string;
}

export function filterUsers(users: UserListDto[], filters: UserFilters) {
	const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";

	return users.filter((user) => {
		const searchableValues = [
			user.email,
			user.firstName,
			user.lastName,
			user.employeeCode ?? "",
			user.role.name,
		];

		return (
			(!normalizedSearch ||
				searchableValues.some((value) =>
					value.toLowerCase().includes(normalizedSearch),
				)) &&
			(!filters.registrationStatus ||
				user.registrationStatus === filters.registrationStatus) &&
			(!filters.role || user.role.name === filters.role) &&
			(!filters.activeStatus ||
				(filters.activeStatus === "ACTIVE" ? user.isActive : !user.isActive))
		);
	});
}
