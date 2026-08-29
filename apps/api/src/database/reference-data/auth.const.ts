import { PERMISSION_DEFINITIONS, Permission, Role } from "@ecommand/shared";
import {
	createReferenceId,
	createReferenceMap,
	defaultReferenceMapper,
} from "./reference-data.utils";

export const ROLES = createReferenceMap(
	{
		[Role.ADMIN]: "Full system access with all permissions",
		[Role.CLIENT_REPRESENTATIVE]:
			"Client-facing representative with order and claims management",
		[Role.AGENT_COMMERCIAL]:
			"Commercial agent with full order lifecycle and customer management",
	},
	defaultReferenceMapper("roles"),
);

export const PERMISSIONS = createReferenceMap(
	PERMISSION_DEFINITIONS,
	(name, { description, parent }) => ({
		id: createReferenceId("permissions", name),
		name,
		description,
		parentId: parent ? createReferenceId("permissions", parent) : undefined,
	}),
);

export const ROLE_PERMISSIONS: Record<Role, Permission[] | "ALL"> = {
	[Role.ADMIN]: "ALL",

	[Role.CLIENT_REPRESENTATIVE]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
		Permission.ORDERS_DELETE,
		Permission.ORDERS_ACTION_SUBMIT,

		Permission.CLAIMS_CREATE,
		Permission.CLAIMS_READ,

		Permission.REPORTS_READ,
		Permission.PROFILE_UPDATE,

		Permission.PROGRAMS_READ,
	],

	[Role.AGENT_COMMERCIAL]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
		Permission.ORDERS_DELETE,
		Permission.ORDERS_MANAGE_OTHER,
		Permission.ORDERS_MANAGE_STATUS,
		Permission.ORDERS_MANAGE_OWNERSHIP,
		Permission.ORDERS_ACTION,

		Permission.CUSTOMERS_READ,
		Permission.CUSTOMERS_UPDATE,

		Permission.CLAIMS_CREATE,
		Permission.CLAIMS_READ,
		Permission.CLAIMS_UPDATE,
		Permission.CLAIMS_MANAGE_STATUS,
		Permission.CLAIMS_ACTION,

		Permission.TRACKING_READ,

		Permission.REPORTS_READ,
		Permission.PROFILE_UPDATE,

		Permission.PROGRAMS_CREATE,
		Permission.PROGRAMS_READ,
		Permission.PROGRAMS_UPDATE,
		Permission.PROGRAMS_MANAGE_STATUS,
		Permission.PROGRAMS_MANAGE_OWNERSHIP,
		Permission.PROGRAMS_ACTION,
	],
};
