import { RegistrationStatus, RolePersona } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { roles, userCustomers, users } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";

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
			persona: true,
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
			persona: true,
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

	async findAssignableRole(id: string) {
		return this.drizzle.db.query.roles.findFirst({
			where: { id, isActive: true },
			columns: {
				id: true,
				name: true,
				persona: true,
				isSystem: true,
			},
		});
	}

	async createUser(values: UserInsert, customerIds?: readonly number[]) {
		return this.drizzle.db.transaction(async (tx) => {
			const [created] = await tx
				.insert(users)
				.values(values)
				.returning({ id: users.id });

			if (customerIds?.length) {
				await tx.insert(userCustomers).values(
					customerIds.map((customerId) => ({
						userId: created.id,
						customerId,
					})),
				);
			}

			return created;
		});
	}

	async updateUserAndAssignments(
		id: UserId,
		values: UserUpdate,
		customerIds?: readonly number[],
	) {
		return this.drizzle.db.transaction(async (tx) => {
			const [updated] = await tx
				.update(users)
				.set(values)
				.where(eq(users.id, id))
				.returning({ id: users.id });

			if (!updated || customerIds === undefined) return updated;

			await tx.delete(userCustomers).where(eq(userCustomers.userId, id));
			if (customerIds.length > 0) {
				await tx
					.insert(userCustomers)
					.values(
						customerIds.map((customerId) => ({ userId: id, customerId })),
					);
			}

			return updated;
		});
	}

	async deactivateUser(id: UserId) {
		return this.drizzle.db.transaction(async (tx) => {
			const activeAdministrators = await tx
				.select({ id: users.id })
				.from(users)
				.innerJoin(roles, eq(users.roleId, roles.id))
				.where(
					and(eq(users.isActive, true), eq(roles.persona, RolePersona.ADMIN)),
				)
				.for("update");

			if (
				activeAdministrators.length === 1 &&
				activeAdministrators[0].id === id
			) {
				return "LAST_ACTIVE_ADMIN" as const;
			}

			const [updated] = await tx
				.update(users)
				.set({ isActive: false })
				.where(eq(users.id, id))
				.returning({ id: users.id });

			return updated;
		});
	}

	async reviewRegistration(
		id: UserId,
		roleId: string,
		status: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED,
	) {
		const [updated] = await this.drizzle.db
			.update(users)
			.set({
				registrationStatus: status,
				isActive: status === RegistrationStatus.APPROVED,
			})
			.where(
				and(
					eq(users.id, id),
					eq(users.roleId, roleId),
					eq(users.registrationStatus, RegistrationStatus.PENDING),
				),
			)
			.returning({ id: users.id });
		return updated;
	}

	async deleteUser(id: UserId) {
		const [deleted] = await this.drizzle.db
			.delete(users)
			.where(eq(users.id, id))
			.returning({
				id: users.id,
			});
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
