import {
	API_ERROR_CODES,
	CATALOG_MANAGEMENT_REQUIREMENTS,
	ManagedReferenceResource,
	Permission,
	Role,
} from "@ecommand/shared";
import {
	ExecutionContext,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { ManagedReferenceDataGuard } from "./managed-reference-data.guard";

describe("ManagedReferenceDataGuard", () => {
	const guard = new ManagedReferenceDataGuard();
	let resource: string;
	let user: AuthUser | undefined;

	function context(): ExecutionContext {
		return {
			switchToHttp: () => ({
				getRequest: () => ({ params: { resource }, user }),
			}),
		} as unknown as ExecutionContext;
	}

	function setUser(permissions: Permission[]) {
		user = {
			id: 1 as AuthUser["id"],
			email: "admin@example.test",
			role: Role.ADMIN,
			permissions: new Set(permissions),
			sessionId: "session",
			customerId: null,
			agencyId: null,
		};
	}

	it.each(Object.entries(CATALOG_MANAGEMENT_REQUIREMENTS))(
		"requires the resource-specific permission for %s",
		(resourceKey, required) => {
			resource = resourceKey;
			setUser([...required]);
			expect(guard.canActivate(context())).toBe(true);
			setUser([Permission.CATALOG_READ]);
			expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
		},
	);

	it("rejects unknown resource names", () => {
		resource = "unregistered";
		setUser([Permission.CATALOG_MANAGE]);
		expect(() => guard.canActivate(context())).toThrow(NotFoundException);
		try {
			guard.canActivate(context());
		} catch (error) {
			expect((error as NotFoundException).getResponse()).toEqual({
				code: API_ERROR_CODES.RESOURCE_NOT_FOUND,
			});
		}
	});

	it("checks permissions instead of role names", () => {
		resource = ManagedReferenceResource.STATIONS;
		setUser([Permission.CATALOG_MANAGE_STATIONS]);
		if (user) user.role = "Custom catalog editor";
		expect(guard.canActivate(context())).toBe(true);
	});
});
