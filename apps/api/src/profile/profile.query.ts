import { users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { UserId, UserUpdate } from "@/users/users.types";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

const profileColumns = {
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

const profileRelations = {
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

export async function findProfile(db: DrizzleDb, id: UserId) {
	return db.query.users.findFirst({
		where: { id },
		columns: profileColumns,
		with: profileRelations,
	});
}

export async function updateProfile(
	db: DrizzleDb,
	id: UserId,
	values: UserUpdate,
) {
	const [updated] = await withDbErrorHandling(
		() =>
			db.update(users).set(values).where(eq(users.id, id)).returning({
				id: users.id,
			}),
		values,
	);

	return updated;
}
