import { Permission } from "@ecommand/shared";
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_ANY_KEY = "permissions:any";
export const PERMISSIONS_ALL_KEY = "permissions:all";

export const RequireAny = (...permissions: Permission[]) =>
	SetMetadata(PERMISSIONS_ANY_KEY, permissions);

export const RequireAll = (...permissions: Permission[]) =>
	SetMetadata(PERMISSIONS_ALL_KEY, permissions);

/** @deprecated Use RequireAll instead */
export const Permissions = (...permissions: Permission[]) =>
	SetMetadata(PERMISSIONS_ALL_KEY, permissions);
