import { API_ERROR_CODES, Permission, RolePersona } from "@ecommand/shared";
import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import { RolesQuery } from "./roles.query";
import { RolesService } from "./roles.service";

describe("RolesService", () => {
	let rolesQuery: jest.Mocked<RolesQuery>;
	let service: RolesService;

	beforeEach(() => {
		rolesQuery = {
			findProfiles: jest.fn(),
			findPermissions: jest.fn(),
			createProfile: jest.fn(),
			updateProfile: jest.fn(),
		} as unknown as jest.Mocked<RolesQuery>;
		service = new RolesService(rolesQuery);
	});

	it("creates an operational profile with selected active permissions", async () => {
		const profile = {
			id: "role-id",
			name: "Order reviewer",
			persona: RolePersona.AGENT_COMMERCIAL,
			isSystem: false,
			isActive: true,
			rolePermissions: [{ permission: { name: Permission.ORDERS_READ } }],
		};
		rolesQuery.findPermissions.mockResolvedValue([
			{ name: Permission.ORDERS_READ },
		] as Awaited<ReturnType<RolesQuery["findPermissions"]>>);
		rolesQuery.createProfile.mockResolvedValue(profile as never);
		rolesQuery.findProfiles.mockResolvedValue([profile] as never);

		await expect(
			service.createProfile(
				{
					name: "Order reviewer",
					persona: RolePersona.AGENT_COMMERCIAL,
					permissionNames: [Permission.ORDERS_READ],
				},
				7,
			),
		).resolves.toMatchObject({
			id: "role-id",
			permissionNames: [Permission.ORDERS_READ],
		});
		expect(rolesQuery.createProfile).toHaveBeenCalledWith(
			expect.objectContaining({ name: "Order reviewer" }),
			7,
		);
	});

	it("rejects reserved grants before persistence", async () => {
		await expect(
			service.createProfile(
				{
					name: "User administrator",
					persona: RolePersona.AGENT_COMMERCIAL,
					permissionNames: [Permission.USERS_DELETE],
				},
				7,
			),
		).rejects.toBeInstanceOf(ForbiddenException);
		expect(rolesQuery.createProfile).not.toHaveBeenCalled();
	});

	it("rejects permission grants that are inactive or missing", async () => {
		rolesQuery.findPermissions.mockResolvedValue([]);

		await expect(
			service.createProfile(
				{
					name: "Order reader",
					persona: RolePersona.AGENT_COMMERCIAL,
					permissionNames: [Permission.ORDERS_READ],
				},
				7,
			),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE },
		});
	});

	it("returns permission codes and structure without backend-authored labels", async () => {
		rolesQuery.findPermissions.mockResolvedValue([
			{
				name: Permission.ORDERS_ACTION_SUBMIT,
				description: "Submit orders for processing",
			},
			{ name: Permission.LOGS_READ, description: "View system audit logs" },
			{ name: "obsolete:permission" as Permission, description: "Old grant" },
		] as Awaited<ReturnType<RolesQuery["findPermissions"]>>);

		await expect(service.findPermissionDefinitions()).resolves.toEqual([
			{
				name: Permission.ORDERS_ACTION_SUBMIT,
				parent: Permission.ORDERS_ACTION,
				assignable: true,
			},
			{
				name: Permission.LOGS_READ,
				parent: undefined,
				assignable: false,
			},
			{
				name: "obsolete:permission",
				parent: undefined,
				assignable: false,
			},
		]);
	});

	it("protects system role profiles and assigned profiles from archiving", async () => {
		rolesQuery.updateProfile
			.mockResolvedValueOnce("SYSTEM_ROLE" as never)
			.mockResolvedValueOnce("ROLE_IN_USE" as never);

		await expect(
			service.updateProfile("system-id", {}, 7),
		).rejects.toBeInstanceOf(ForbiddenException);
		await expect(
			service.updateProfile("assigned-id", { isActive: false }, 7),
		).rejects.toBeInstanceOf(ConflictException);
	});

	it("returns a not-found error for unknown profiles", async () => {
		rolesQuery.updateProfile.mockResolvedValue(undefined as never);

		await expect(
			service.updateProfile("missing-id", {}, 7),
		).rejects.toBeInstanceOf(NotFoundException);
	});
});
