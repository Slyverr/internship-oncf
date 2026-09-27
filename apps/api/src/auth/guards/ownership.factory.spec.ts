import { Permission } from "@ecommand/shared";
import {
	type ExecutionContext,
	ForbiddenException,
	type PipeTransform,
} from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { createOwnershipGuard } from "./ownership.factory";

class OwnedResourceService {}
const resourceService = {};
const identityPipe: PipeTransform<string, number> = {
	transform: (value) => Number(value),
};

function createGuard({
	ownerId = 12,
	ownerMissing = false,
	permissionGranted = false,
	param = "12",
	canAccess,
}: {
	ownerId?: number;
	ownerMissing?: boolean;
	permissionGranted?: boolean;
	param?: string;
	canAccess?: (id: number, user: AuthUser) => Promise<boolean | undefined>;
} = {}) {
	const user = {
		id: 12,
		permissions: new Set(
			permissionGranted ? [Permission.ORDERS_MANAGE_OTHER] : [],
		),
	} as AuthUser;
	const request = { params: { id: param }, user };
	const moduleRef = { get: jest.fn().mockReturnValue(resourceService) };
	const Guard = createOwnershipGuard<OwnedResourceService, number>({
		service: OwnedResourceService,
		pipe: identityPipe,
		permission: Permission.ORDERS_MANAGE_OTHER,
		resolveOwnerId: async () => (ownerMissing ? undefined : ownerId),
		...(canAccess && {
			canAccess: (_service, id, authUser) => canAccess(id, authUser),
		}),
	});
	const guard = new Guard(moduleRef as never);
	const context = {
		switchToHttp: () => ({ getRequest: () => request }),
	} as ExecutionContext;
	return { guard, moduleRef, request, context };
}

describe("createOwnershipGuard", () => {
	it("allows the owner", async () => {
		const { guard, moduleRef, context } = createGuard({ ownerId: 12 });
		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(moduleRef.get).toHaveBeenCalledWith(OwnedResourceService, {
			strict: false,
		});
	});

	it("blocks another user from accessing the resource", async () => {
		const { guard, context } = createGuard({ ownerId: 77 });
		await expect(guard.canActivate(context)).rejects.toThrow(
			new ForbiddenException("You can only access your own resources"),
		);
	});

	it("lets the route handler return its not-found response when the resource does not exist", async () => {
		const { guard, context } = createGuard({ ownerMissing: true });
		await expect(guard.canActivate(context)).resolves.toBe(true);
	});

	it("bypasses the lookup for users with the manage permission", async () => {
		const { guard, moduleRef, context } = createGuard({
			permissionGranted: true,
		});
		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(moduleRef.get).not.toHaveBeenCalled();
	});

	it("lets the route handler resolve a missing resource from a canAccess guard", async () => {
		const { guard, context } = createGuard({
			canAccess: async () => undefined,
		});
		await expect(guard.canActivate(context)).resolves.toBe(true);
	});

	it("allows requests without a guarded route parameter", async () => {
		const { guard, moduleRef, context } = createGuard({ param: "" });
		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(moduleRef.get).not.toHaveBeenCalled();
	});
});
