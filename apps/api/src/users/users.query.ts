import { users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import {
	DrizzleDb,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { UserEmail, UserId, UserInsert, UserUpdate } from "./users.types";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

const userListColumns = {
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

const userListRelations = {
	role: {
		columns: {
			id: true,
			name: true,
		},
	},
} satisfies UsersRelations;

const userAuthColumns = {
	id: true,
	email: true,
	password: true,
	isActive: true,
	customerId: true,
	agencyId: true,
} satisfies UsersColumns;

const userAuthRelations = {
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

export async function findUsers(db: DrizzleDb) {
	return db.query.users.findMany({
		columns: userListColumns,
		with: userListRelations,
	});
}

export async function findUser(db: DrizzleDb, id: UserId) {
	return db.query.users.findFirst({
		where: { id },
		columns: userListColumns,
		with: userListRelations,
	});
}

export async function findUserByEmail(db: DrizzleDb, email: UserEmail) {
	return db.query.users.findFirst({
		where: { email },
	});
}

export async function findUserForAuth(db: DrizzleDb, id: UserId) {
	return db.query.users.findFirst({
		where: { id },
		columns: userAuthColumns,
		with: userAuthRelations,
	});
}

export async function createUser(db: DrizzleDb, values: UserInsert) {
	const [created] = await withDbErrorHandling(
		() =>
			db.insert(users).values(values).returning({
				id: users.id,
			}),
		values,
	);

	return created;
}

export async function updateUser(
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

export async function deleteUser(db: DrizzleDb, id: UserId) {
	const [deleted] = await withDbErrorHandling(
		() =>
			db.delete(users).where(eq(users.id, id)).returning({
				id: users.id,
			}),
		{ id },
	);

	return deleted;
}

export async function findUserExists(db: DrizzleDb, id: UserId) {
	const user = await db.query.users.findFirst({
		where: { id },
		columns: {
			id: true,
		},
	});

	return !!user;
}
