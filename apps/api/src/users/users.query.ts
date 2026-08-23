import { QueryColumns, QueryRelations } from "src/db/drizzle.types";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

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

export const userAuthColumns = {
	id: true,
	email: true,
	password: true,
	isActive: true,
	customerId: true,
	agencyId: true,
} satisfies UsersColumns;

export const userAuthRelations = {
	role: {
		columns: {
			name: true,
		},
		with: {
			rolePermissions: {
				columns: {},
				with: {
					permission: {
						columns: {
							name: true,
						},
					},
				},
			},
		},
	},
} satisfies UsersRelations;
