import { NotificationOwnershipGuard } from "./guards/notification-ownership.guard";
import { NotificationsController } from "./notifications.controller";
import type { NotificationsService } from "./notifications.service";

const user = { id: 31 };
const endpoints = [
	{
		action: "findAll",
		method: "findAll",
		args: [{ user }],
		serviceArgs: [user],
	},
	{
		action: "getUnreadCount",
		method: "getUnreadCount",
		args: [{ user }],
		serviceArgs: [user.id],
	},
	{
		action: "markAsRead",
		method: "markAsRead",
		args: [7, { user }],
		serviceArgs: [7, user.id],
	},
	{
		action: "markAllAsRead",
		method: "markAllAsRead",
		args: [{ user }],
		serviceArgs: [user.id],
	},
] as const;

describe("NotificationsController user scoping", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ method }) => method))].map((method) => [
			method,
			jest.fn().mockResolvedValue({ method }),
		]),
	);
	const controller = new NotificationsController(
		service as unknown as NotificationsService,
	);
	const methods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;
	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
	});
	it.each(endpoints)(
		"forwards the authenticated user scope to $action",
		async ({ action, method, args, serviceArgs }) => {
			await expect(methods[action](...args)).resolves.toEqual({ method });
			expect(service[method]).toHaveBeenCalledWith(...serviceArgs);
		},
	);
	it("uses the ownership guard for notification ID routes", () => {
		expect(
			Reflect.getMetadata("__guards__", NotificationsController),
		).toContain(NotificationOwnershipGuard);
	});
});
