import type { ExecutionContext } from "@nestjs/common";
import { NotificationOwnershipGuard } from "./notification-ownership.guard";

describe("NotificationOwnershipGuard", () => {
	it("lets missing notification IDs reach service not-found handling", async () => {
		const service = {
			findOneForOwnership: jest.fn().mockResolvedValue(undefined),
		};
		const moduleRef = { get: jest.fn().mockReturnValue(service) };
		const guard = new NotificationOwnershipGuard(moduleRef as never);
		const context = {
			switchToHttp: () => ({
				getRequest: () => ({
					params: { id: "7" },
					user: { id: 31, permissions: new Set() },
				}),
			}),
		} as ExecutionContext;
		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(service.findOneForOwnership).toHaveBeenCalledWith(7);
	});
});
