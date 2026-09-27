import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { UsersController } from "./users.controller";
import type { UsersService } from "./users.service";

const user = { id: 7 };
const endpoints = [
	{
		action: "findAll",
		permission: Permission.USERS_READ,
		method: "findAll",
		args: [],
	},
	{
		action: "findOne",
		permission: Permission.USERS_READ,
		method: "findOne",
		args: [42],
	},
	{
		action: "create",
		permission: Permission.USERS_CREATE,
		method: "create",
		args: [{ email: "new@oncf.ma" }, { user }],
		serviceArgs: [{ email: "new@oncf.ma" }, user],
	},
	{
		action: "update",
		permission: Permission.USERS_UPDATE,
		method: "update",
		args: [42, { firstName: "Updated" }, { user }],
		serviceArgs: [42, { firstName: "Updated" }, user],
	},
	{
		action: "deactivate",
		permission: Permission.USERS_DELETE,
		method: "deactivate",
		args: [42],
	},
] as const;

describe("UsersController authorization mapping", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ method }) => method))].map((method) => [
			method,
			jest.fn().mockResolvedValue({ method }),
		]),
	);
	const controller = new UsersController(service as unknown as UsersService);
	const methods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;
	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
	});
	it.each(endpoints)(
		"requires $permission for $action and forwards input",
		async (endpoint) => {
			const { action, permission, method, args } = endpoint;
			const serviceArgs =
				"serviceArgs" in endpoint ? endpoint.serviceArgs : args;
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					UsersController.prototype[action],
				),
			).toEqual([permission]);
			await expect(methods[action](...args)).resolves.toEqual({ method });
			expect(service[method]).toHaveBeenCalledWith(...serviceArgs);
		},
	);
});
