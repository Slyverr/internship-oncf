import { API_ERROR_CODES, Permission, RolePersona } from "@ecommand/shared";
import { rolePermissions, roles } from "drizzle/schema";
import type { DrizzleService } from "@/database/drizzle.service";
import { RolesQuery } from "./roles.query";

describe("RolesQuery", () => {
	it("loads profiles with permission codes ordered by name", async () => {
		const findMany = jest.fn().mockResolvedValue([]);
		const query = new RolesQuery({
			db: { query: { roles: { findMany } } },
		} as unknown as DrizzleService);

		await query.findProfiles();

		expect(findMany).toHaveBeenCalledWith({
			with: {
				rolePermissions: {
					with: { permission: { columns: { name: true } } },
				},
			},
			orderBy: { name: "asc" },
		});
	});

	it("only lists active permissions for profile assignment", async () => {
		const findMany = jest.fn().mockResolvedValue([]);
		const query = new RolesQuery({
			db: { query: { permissions: { findMany } } },
		} as unknown as DrizzleService);

		await query.findPermissions();

		expect(findMany).toHaveBeenCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	});

	it("creates a profile and grants permissions in one transaction", async () => {
		const selectedPermissions = [
			{ id: "permission-1", name: Permission.ORDERS_READ },
			{ id: "permission-2", name: Permission.ORDERS_UPDATE },
		];
		const created = {
			id: "created-role",
			name: "Order reviewer",
			persona: RolePersona.AGENT_COMMERCIAL,
		};
		const findMany = jest.fn().mockResolvedValue(selectedPermissions);
		const roleReturning = jest.fn().mockResolvedValue([created]);
		const roleValues = jest.fn().mockReturnValue({ returning: roleReturning });
		const permissionValues = jest.fn().mockResolvedValue(undefined);
		const activityValues = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn((table: unknown) => {
			if (table === roles) return { values: roleValues };
			if (table === rolePermissions) return { values: permissionValues };
			return { values: activityValues };
		});
		const tx = { query: { permissions: { findMany } }, insert };
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.createProfile(
				{
					name: "  Order reviewer  ",
					description: "  Review customer orders  ",
					persona: RolePersona.AGENT_COMMERCIAL,
					permissionNames: [Permission.ORDERS_READ, Permission.ORDERS_UPDATE],
				} as never,
				7,
			),
		).resolves.toBe(created);

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(findMany).toHaveBeenCalledWith({
			where: {
				name: {
					in: [Permission.ORDERS_READ, Permission.ORDERS_UPDATE],
				},
				isActive: true,
			},
			columns: { id: true, name: true },
		});
		expect(roleValues).toHaveBeenCalledWith({
			id: expect.any(String),
			name: "Order reviewer",
			description: "Review customer orders",
			persona: RolePersona.AGENT_COMMERCIAL,
			isSystem: false,
		});
		const roleId = roleValues.mock.calls[0][0].id;
		expect(permissionValues).toHaveBeenCalledWith([
			{ roleId, permissionId: "permission-1" },
			{ roleId, permissionId: "permission-2" },
		]);
		expect(activityValues).toHaveBeenCalledWith({
			actorUserId: 7,
			actionType: "ROLE_PROFILE_CREATED",
			actionDetails: JSON.stringify({
				roleId,
				name: created.name,
				persona: created.persona,
				permissionNames: [Permission.ORDERS_READ, Permission.ORDERS_UPDATE],
			}),
		});
	});

	it("rejects inactive or missing permissions before inserting a profile", async () => {
		const findMany = jest.fn().mockResolvedValue([]);
		const insert = jest.fn();
		const tx = { query: { permissions: { findMany } }, insert };
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.createProfile(
				{
					name: "Reader",
					persona: RolePersona.AGENT_COMMERCIAL,
					permissionNames: [Permission.ORDERS_READ],
				} as never,
				7,
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE },
		});
		expect(insert).not.toHaveBeenCalled();
	});

	it("rejects unavailable replacement permissions before deleting existing grants", async () => {
		const permissionFindMany = jest.fn().mockResolvedValue([]);
		const deleteWhere = jest.fn();
		const deleteQuery = jest.fn().mockReturnValue({ where: deleteWhere });
		const insert = jest.fn();
		const update = jest.fn();
		const tx = {
			query: {
				roles: {
					findFirst: jest.fn().mockResolvedValue({
						id: "custom-role",
						name: "Reader",
						isSystem: false,
					}),
				},
				permissions: { findMany: permissionFindMany },
			},
			delete: deleteQuery,
			insert,
			update,
		};
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.updateProfile(
				"custom-role",
				{ permissionNames: [Permission.ORDERS_READ] } as never,
				7,
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE },
		});
		expect(deleteQuery).not.toHaveBeenCalled();
		expect(deleteWhere).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});

	it("does not mutate built-in role profiles", async () => {
		const update = jest.fn();
		const tx = {
			query: {
				roles: {
					findFirst: jest.fn().mockResolvedValue({
						id: "system-role",
						isSystem: true,
					}),
				},
			},
			update,
		};
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.updateProfile("system-role", { name: "Changed" } as never, 7),
		).resolves.toBe("SYSTEM_ROLE");
		expect(update).not.toHaveBeenCalled();
	});

	it("prevents archiving an assigned custom profile", async () => {
		const update = jest.fn();
		const findUsers = jest.fn().mockResolvedValue({ id: 11 });
		const tx = {
			query: {
				roles: {
					findFirst: jest.fn().mockResolvedValue({
						id: "assigned-role",
						isSystem: false,
					}),
				},
				users: { findFirst: findUsers },
			},
			update,
		};
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.updateProfile("assigned-role", { isActive: false } as never, 7),
		).resolves.toBe("ROLE_IN_USE");
		expect(findUsers).toHaveBeenCalledWith({
			where: { roleId: "assigned-role" },
			columns: { id: true },
		});
		expect(update).not.toHaveBeenCalled();
	});

	it("updates profile details and replaces grants atomically", async () => {
		const current = {
			id: "custom-role",
			name: "Old name",
			persona: RolePersona.AGENT_COMMERCIAL,
			isSystem: false,
		};
		const updated = {
			id: current.id,
			name: "New name",
			persona: current.persona,
		};
		const permissionFindMany = jest
			.fn()
			.mockResolvedValue([{ id: "permission-1" }]);
		const deleteWhere = jest.fn().mockResolvedValue(undefined);
		const deleteQuery = jest.fn().mockReturnValue({ where: deleteWhere });
		const permissionValues = jest.fn().mockResolvedValue(undefined);
		const activityValues = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn((table: unknown) =>
			table === rolePermissions
				? { values: permissionValues }
				: { values: activityValues },
		);
		const updateReturning = jest.fn().mockResolvedValue([updated]);
		const updateWhere = jest.fn().mockReturnValue({
			returning: updateReturning,
		});
		const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
		const update = jest.fn().mockReturnValue({ set: updateSet });
		const tx = {
			query: {
				roles: { findFirst: jest.fn().mockResolvedValue(current) },
				permissions: { findMany: permissionFindMany },
			},
			delete: deleteQuery,
			insert,
			update,
		};
		const transaction = jest.fn().mockImplementation((run) => run(tx));
		const query = new RolesQuery({
			db: { transaction },
		} as unknown as DrizzleService);

		await expect(
			query.updateProfile(
				current.id,
				{
					name: "  New name  ",
					description: "  ",
					persona: RolePersona.AGENT_COMMERCIAL,
					isActive: true,
					permissionNames: [Permission.ORDERS_READ],
				} as never,
				7,
			),
		).resolves.toBe(updated);

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(deleteQuery).toHaveBeenCalledWith(rolePermissions);
		expect(deleteWhere).toHaveBeenCalledTimes(1);
		expect(permissionValues).toHaveBeenCalledWith([
			{ roleId: current.id, permissionId: "permission-1" },
		]);
		expect(update).toHaveBeenCalledWith(roles);
		expect(updateSet).toHaveBeenCalledWith({
			name: "New name",
			description: null,
			persona: RolePersona.AGENT_COMMERCIAL,
			isActive: true,
		});
		expect(activityValues).toHaveBeenCalledWith({
			actorUserId: 7,
			actionType: "ROLE_PROFILE_RESTORED",
			actionDetails: JSON.stringify({
				roleId: current.id,
				previousName: current.name,
				name: updated.name,
				persona: updated.persona,
				permissionNames: [Permission.ORDERS_READ],
			}),
		});
	});
});
