import { QueryColumns, QueryRelations } from "src/database/drizzle.types";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

export const profileColumns = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	employeeId: true,
	type: true,
	roleId: true,
	customerId: true,
	agencyId: true,
	createdAt: true,
	lastLogin: true,
} satisfies UsersColumns;

export const profileRelations = {
	role: {
		columns: { name: true },
		with: {
			rolePermissions: {
				columns: {},
				with: {
					permission: {
						columns: { name: true },
					},
				},
			},
		},
	},
} satisfies UsersRelations;
