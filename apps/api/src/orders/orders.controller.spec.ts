import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { OrderOwnershipGuard } from "./guards/order-ownership.guard";
import { OrdersController } from "./orders.controller";
import type { OrdersService } from "./orders.service";

const user = { id: 7 };
const body = { reason: "Duplicate" };
const query = { page: 1 };
const order = { orderNumber: "ORD-1" };
const orderNumber = "ORD-ABCDEFGHIJ";
const endpoints = [
	{
		action: "create",
		permission: Permission.ORDERS_CREATE,
		serviceMethod: "create",
		args: [order, { user }],
		serviceArgs: [order, user],
	},
	{
		action: "findAll",
		permission: Permission.ORDERS_READ,
		serviceMethod: "findAll",
		args: [{ user }, query],
		serviceArgs: [user, query],
	},
	{
		action: "findEligibleForPrograms",
		permission: Permission.ORDERS_READ,
		serviceMethod: "findEligibleForPrograms",
		args: [{ user }, query],
		serviceArgs: [user, query],
	},
	{
		action: "findOne",
		permission: Permission.ORDERS_READ,
		serviceMethod: "findOne",
		args: [orderNumber],
		serviceArgs: [42],
	},
	{
		action: "update",
		permission: Permission.ORDERS_UPDATE,
		serviceMethod: "update",
		args: [orderNumber, { notes: "Updated" }, { user }],
		serviceArgs: [42, { notes: "Updated" }, user],
	},
	{
		action: "submit",
		permission: Permission.ORDERS_ACTION_SUBMIT,
		serviceMethod: "submit",
		args: [orderNumber, { user }],
		serviceArgs: [42, user],
	},
	{
		action: "approve",
		permission: Permission.ORDERS_ACTION_APPROVE,
		serviceMethod: "approve",
		args: [orderNumber, { user }],
		serviceArgs: [42, user],
	},
	{
		action: "reject",
		permission: Permission.ORDERS_ACTION_REJECT,
		serviceMethod: "reject",
		args: [orderNumber, body, { user }],
		serviceArgs: [42, body.reason, user],
	},
	{
		action: "cancel",
		permission: Permission.ORDERS_ACTION_CANCEL,
		serviceMethod: "cancel",
		args: [orderNumber, { user }],
		serviceArgs: [42, user],
	},
	{
		action: "sendToDtm",
		permission: Permission.ORDERS_ACTION_SEND_TO_DTM,
		serviceMethod: "sendToDtm",
		args: [orderNumber, { user }],
		serviceArgs: [42, user],
	},
	{
		action: "remove",
		permission: Permission.ORDERS_DELETE,
		serviceMethod: "remove",
		args: [orderNumber],
		serviceArgs: [42],
	},
] as const;

describe("OrdersController authorization and user scope", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ serviceMethod }) => serviceMethod))].map(
			(method) => [method, jest.fn().mockResolvedValue({ method })],
		),
	);
	service.resolveOrderId = jest.fn().mockResolvedValue(42);
	const controller = new OrdersController(service as unknown as OrdersService);
	const methods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;
	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
		service.resolveOrderId.mockResolvedValue(42);
	});
	it.each(endpoints)(
		"requires $permission for $action and forwards its input",
		async (endpoint) => {
			const { action, permission, serviceMethod, args } = endpoint;
			const serviceArgs =
				"serviceArgs" in endpoint ? endpoint.serviceArgs : args;
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					OrdersController.prototype[action],
				),
			).toEqual([permission]);
			await expect(methods[action](...args)).resolves.toEqual({
				method: serviceMethod,
			});
			expect(service[serviceMethod]).toHaveBeenCalledWith(...serviceArgs);
			if (
				action !== "create" &&
				action !== "findAll" &&
				action !== "findEligibleForPrograms"
			) {
				expect(service.resolveOrderId).toHaveBeenCalledWith(orderNumber);
			}
		},
	);
	it("applies ownership checks across order routes", () => {
		expect(Reflect.getMetadata("__guards__", OrdersController)).toContain(
			OrderOwnershipGuard,
		);
	});
});
