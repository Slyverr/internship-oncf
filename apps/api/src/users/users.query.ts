import { RegistrationStatus } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { userCustomers, users } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { UserEmail, UserId, UserInsert, UserUpdate } from "./users.types";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

const userListColumns = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	employeeCode: true,
	type: true,
	roleId: true,
	registrationStatus: true,
	customerId: true,
	agencyId: true,
	isActive: true,
	lastLogin: true,
	createdAt: true,
	updatedAt: true,
} satisfies UsersColumns;

const userListRelations = {
	userCustomers: {
		columns: { customerId: true },
	},
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
	registrationStatus: true,
	customerId: true,
	agencyId: true,
} satisfies UsersColumns;

const userAuthRelations = {
	userCustomers: {
		columns: { customerId: true },
	},
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

@Injectable()
export class UsersQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findUsers() {
		return this.drizzle.db.query.users.findMany({
			columns: userListColumns,
			with: userListRelations,
		});
	}

	async findUser(id: UserId) {
		return this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: userListColumns,
			with: userListRelations,
		});
	}

	async findUserByEmail(email: UserEmail) {
		return this.drizzle.db.query.users.findFirst({
			where: { email },
		});
	}

	async findUserByLoginIdentifier(identifier: string) {
		return this.drizzle.db.query.users.findFirst({
			where: identifier.includes("@")
				? { email: { ilike: identifier } }
				: { employeeCode: { ilike: identifier } },
		});
	}

	async findUserEmailExists(email: UserEmail) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { email: { ilike: email } },
			columns: { id: true },
		});
		return !!user;
	}

	async findUserForAuth(id: UserId) {
		return this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: userAuthColumns,
			with: userAuthRelations,
		});
	}

	async createUser(values: UserInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(users).values(values).returning({
					id: users.id,
				}),
			values,
		);
		return created;
	}

	async replaceCustomerAssignments(
		userId: UserId,
		customerIds: readonly number[],
	) {
		await this.drizzle.db.transaction(async (tx) => {
			await tx.delete(userCustomers).where(eq(userCustomers.userId, userId));
			if (customerIds.length > 0) {
				await tx
					.insert(userCustomers)
					.values(customerIds.map((customerId) => ({ userId, customerId })));
			}
		});
	}

	async updateUser(id: UserId, values: UserUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(users)
					.set(values)
					.where(eq(users.id, id))
					.returning({
						id: users.id,
					}),
			values,
		);
		return updated;
	}

	async reviewRegistration(
		id: UserId,
		roleId: string,
		status: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED,
	) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(users)
					.set({
						registrationStatus: status,
						isActive: status === RegistrationStatus.APPROVED,
						updatedAt: new Date().toISOString(),
					})
					.where(
						and(
							eq(users.id, id),
							eq(users.roleId, roleId),
							eq(users.registrationStatus, RegistrationStatus.PENDING),
						),
					)
					.returning({ id: users.id }),
			{ id, roleId, status },
		);
		return updated;
	}

	async deleteUser(id: UserId) {
		const [deleted] = await withDbErrorHandling(
			() =>
				this.drizzle.db.delete(users).where(eq(users.id, id)).returning({
					id: users.id,
				}),
			{ id },
		);
		return deleted;
	}

	async findUserExists(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: {
				id: true,
			},
		});
		return !!user;
	}
}
