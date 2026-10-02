import { randomUUID } from "node:crypto";
import { API_ERROR_CODES } from "@ecommand/shared";
import { BadRequestException, Injectable } from "@nestjs/common";
import { rolePermissions, roles, userActivityLog } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { CreateRoleProfileDto } from "./requests/create-role-profile.dto";
import type { UpdateRoleProfileDto } from "./requests/update-role-profile.dto";

@Injectable()
export class RolesQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findProfiles() {
		return this.drizzle.db.query.roles.findMany({
			with: {
				rolePermissions: {
					with: {
						permission: { columns: { name: true } },
					},
				},
			},
			orderBy: { name: "asc" },
		});
	}

	async findPermissions() {
		return this.drizzle.db.query.permissions.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async createProfile(input: CreateRoleProfileDto, actorUserId: number) {
		const id = randomUUID();
		return withDbErrorHandling(
			() =>
				this.drizzle.db.transaction(async (tx) => {
					const selectedPermissions = await tx.query.permissions.findMany({
						where: { name: { in: input.permissionNames }, isActive: true },
						columns: { id: true, name: true },
					});
					if (selectedPermissions.length !== input.permissionNames.length) {
						throw new BadRequestException({
							code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE,
						});
					}

					const [created] = await tx
						.insert(roles)
						.values({
							id,
							name: input.name.trim(),
							description: input.description?.trim() || null,
							persona: input.persona,
							isSystem: false,
						})
						.returning();

					if (selectedPermissions.length > 0) {
						await tx.insert(rolePermissions).values(
							selectedPermissions.map(({ id: permissionId }) => ({
								roleId: id,
								permissionId,
							})),
						);
					}

					await tx.insert(userActivityLog).values({
						actorUserId,
						actionType: "ROLE_PROFILE_CREATED",
						actionDetails: JSON.stringify({
							roleId: id,
							name: created.name,
							persona: created.persona,
							permissionNames: input.permissionNames,
						}),
					});

					return created;
				}),
			{ name: input.name.trim() },
		);
	}

	async updateProfile(
		id: string,
		input: UpdateRoleProfileDto,
		actorUserId: number,
	) {
		return withDbErrorHandling(
			() =>
				this.drizzle.db.transaction(async (tx) => {
					const current = await tx.query.roles.findFirst({
						where: { id },
					});
					if (!current) return undefined;
					if (current.isSystem) return "SYSTEM_ROLE" as const;

					if (input.isActive === false) {
						const assignedUser = await tx.query.users.findFirst({
							where: { roleId: id },
							columns: { id: true },
						});
						if (assignedUser) return "ROLE_IN_USE" as const;
					}

					if (input.permissionNames !== undefined) {
						const selectedPermissions = await tx.query.permissions.findMany({
							where: {
								name: { in: input.permissionNames },
								isActive: true,
							},
							columns: { id: true },
						});
						if (selectedPermissions.length !== input.permissionNames.length) {
							throw new BadRequestException({
								code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE,
							});
						}
						await tx
							.delete(rolePermissions)
							.where(eq(rolePermissions.roleId, id));
						if (selectedPermissions.length > 0) {
							await tx.insert(rolePermissions).values(
								selectedPermissions.map(({ id: permissionId }) => ({
									roleId: id,
									permissionId,
								})),
							);
						}
					}

					const values = {
						...(input.name !== undefined && { name: input.name.trim() }),
						...(input.description !== undefined && {
							description: input.description?.trim() || null,
						}),
						...(input.persona !== undefined && { persona: input.persona }),
						...(input.isActive !== undefined && { isActive: input.isActive }),
						updatedAt: new Date().toISOString(),
					};
					const [updated] = await tx
						.update(roles)
						.set(values)
						.where(eq(roles.id, id))
						.returning();

					await tx.insert(userActivityLog).values({
						actorUserId,
						actionType:
							input.isActive === false
								? "ROLE_PROFILE_ARCHIVED"
								: input.isActive === true
									? "ROLE_PROFILE_RESTORED"
									: "ROLE_PROFILE_UPDATED",
						actionDetails: JSON.stringify({
							roleId: id,
							previousName: current.name,
							name: updated.name,
							persona: updated.persona,
							permissionNames: input.permissionNames,
						}),
					});

					return updated;
				}),
			{ id, name: input.name?.trim() },
		);
	}
}
