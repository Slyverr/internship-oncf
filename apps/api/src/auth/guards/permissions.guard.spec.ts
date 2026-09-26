import { Permission, Role } from "@ecommand/shared";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthUser } from "../auth.types";
import {
	PERMISSIONS_ALL_KEY,
	PERMISSIONS_ANY_KEY,
} from "../permissions.decorator";
import { PermissionsGuard } from "./permissions.guard";

describe("PermissionsGuard", () => {
	const handler = jest.fn();
	const controller = jest.fn();
	let metadata: Record<string, Permission[] | undefined>;
	let user: AuthUser | undefined;
	let guard: PermissionsGuard;

	beforeEach(() => {
		metadata = {};
		user = undefined;
		const reflector = {
			getAllAndOverride: jest.fn((key: string) => metadata[key]),
		} as unknown as Reflector;
		guard = new PermissionsGuard(reflector);
	});

	function context(): ExecutionContext {
		return {
			getHandler: () => handler,
			getClass: () => controller,
			switchToHttp: () => ({ getRequest: () => ({ user }) }),
		} as unknown as ExecutionContext;
	}

	function authenticatedUser(permissions: Permission[]): AuthUser {
		return {
			id: 1 as AuthUser["id"],
			email: "agent@example.test",
			role: Role.AGENT_COMMERCIAL,
			permissions: new Set(permissions),
			sessionId: "session",
			customerId: null,
			agencyId: null,
		};
	}

	it("allows routes without permission metadata", () => {
		expect(guard.canActivate(context())).toBe(true);
	});

	it("rejects a protected route when the request has no user", () => {
		metadata[PERMISSIONS_ANY_KEY] = [Permission.ORDERS_READ];
		expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
	});

	it("allows any required permission, including a granted parent permission", () => {
		metadata[PERMISSIONS_ANY_KEY] = [Permission.CLAIMS_ACTION_START_TREATMENT];
		user = authenticatedUser([Permission.CLAIMS_ACTION]);
		expect(guard.canActivate(context())).toBe(true);
	});

	it("rejects when none of the required any-permissions are granted", () => {
		metadata[PERMISSIONS_ANY_KEY] = [
			Permission.ORDERS_READ,
			Permission.PROGRAMS_READ,
		];
		user = authenticatedUser([Permission.CATALOG_READ]);
		expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
	});

	it("requires every permission declared with RequireAll", () => {
		metadata[PERMISSIONS_ALL_KEY] = [
			Permission.ORDERS_READ,
			Permission.REPORTS_READ,
		];
		user = authenticatedUser([Permission.ORDERS_READ]);
		expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
		user = authenticatedUser([Permission.ORDERS_READ, Permission.REPORTS_READ]);
		expect(guard.canActivate(context())).toBe(true);
	});

	it("checks any and all metadata when both are present", () => {
		metadata[PERMISSIONS_ANY_KEY] = [Permission.ORDERS_READ];
		metadata[PERMISSIONS_ALL_KEY] = [Permission.REPORTS_READ];
		user = authenticatedUser([Permission.ORDERS_READ]);
		expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
		user = authenticatedUser([Permission.ORDERS_READ, Permission.REPORTS_READ]);
		expect(guard.canActivate(context())).toBe(true);
	});
});
