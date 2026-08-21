import { QueryColumns } from "src/db/drizzle.types";

type UsersColumns = QueryColumns<"users">;

export const userListColumns = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	employeeId: true,
	type: true,
	roleId: true,
	customerId: true,
	agencyId: true,
	isActive: true,
	lastLogin: true,
	createdAt: true,
	updatedAt: true,
} satisfies UsersColumns;

export const userDetailColumns = userListColumns;
