import { Permission } from "@ecommand/shared";
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: Permission[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
