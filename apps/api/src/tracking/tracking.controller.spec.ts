import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { OrderOwnershipGuard } from "@/orders/guards/order-ownership.guard";
import type { OrdersService } from "@/orders/orders.service";
import { TrackingController } from "./tracking.controller";
import type { TrackingService } from "./tracking.service";

const dto = { latitude: 35, longitude: -5 };
const orderNumber = "ORD-ABCDEFGHIJ";
const endpoints = [
	{
		action: "trackWagon",
		permission: Permission.TRACKING_READ,
		method: "trackWagon",
		args: ["W-1"],
	},
	{
		action: "trackTrain",
		permission: Permission.TRACKING_READ,
		method: "trackTrain",
		args: ["T-1"],
	},
	{
		action: "trackOrder",
		permission: Permission.TRACKING_READ,
		method: "trackOrder",
		args: [orderNumber],
		serviceArgs: [23],
	},
	{
		action: "updateWagonPosition",
		permission: Permission.TRACKING_UPDATE,
		method: "updateWagonPosition",
		args: [2, dto],
	},
	{
		action: "updateTrainPosition",
		permission: Permission.TRACKING_UPDATE,
		method: "updateTrainPosition",
		args: [3, dto],
	},
] as const;

describe("TrackingController authorization mapping", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ method }) => method))].map((method) => [
			method,
			jest.fn().mockResolvedValue({ method }),
		]),
	);
	const ordersService = { resolveOrderId: jest.fn().mockResolvedValue(23) };
	const controller = new TrackingController(
		service as unknown as TrackingService,
		ordersService as unknown as OrdersService,
	);
	const methods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;
	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
		ordersService.resolveOrderId.mockClear().mockResolvedValue(23);
	});
	it.each(endpoints)(
		"requires $permission for $action and forwards input",
		async ({ action, permission, method, args, ...endpoint }) => {
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					TrackingController.prototype[action],
				),
			).toEqual([permission]);
			await expect(methods[action](...args)).resolves.toEqual({ method });
			const serviceArgs =
				"serviceArgs" in endpoint ? endpoint.serviceArgs : args;
			expect(service[method]).toHaveBeenCalledWith(...serviceArgs);
			if (action === "trackOrder") {
				expect(ordersService.resolveOrderId).toHaveBeenCalledWith(orderNumber);
			}
		},
	);
	it("checks order ownership for order tracking", () => {
		expect(
			Reflect.getMetadata(
				"__guards__",
				TrackingController.prototype.trackOrder,
			),
		).toContain(OrderOwnershipGuard);
	});
});
