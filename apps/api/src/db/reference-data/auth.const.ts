import { Permission, Role } from "./auth.enum";

export const ROLE_PERMISSIONS: Record<Role, Permission[] | "ALL"> = {
	[Role.ADMIN]: "ALL",

	[Role.CLIENT_REPRESENTATIVE]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.CLAIMS_CREATE,
		Permission.CLAIMS_READ,
		Permission.TRACKING_READ,
		Permission.PROFILE_UPDATE,
		Permission.PROGRAMS_READ,
	],

	[Role.AGENT_COMMERCIAL]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
		Permission.ORDERS_EXECUTE,
		Permission.CUSTOMERS_READ,
		Permission.CUSTOMERS_UPDATE,
		Permission.CLAIMS_READ,
		Permission.CLAIMS_UPDATE,
		Permission.CLAIMS_DELETE,
		Permission.TRACKING_READ,
		Permission.REPORTS_READ,
		Permission.PROFILE_UPDATE,
		Permission.PROGRAMS_CREATE,
		Permission.PROGRAMS_READ,
		Permission.PROGRAMS_APPROVE,
		Permission.PROGRAMS_SEND,
		Permission.PROGRAMS_EXECUTE,
	],
};
