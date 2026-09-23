import { Permission, Role } from "../enums";

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[] | "ALL"> = {
	[Role.ADMIN]: "ALL",

	[Role.CLIENT_REPRESENTATIVE]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
		Permission.ORDERS_DELETE,
		Permission.ORDERS_ACTION_SUBMIT,

		Permission.CATALOG_READ,

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

		Permission.CATALOG_READ,

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
