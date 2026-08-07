import { Permission, Role } from "./auth.enum";

export const ROLES: Record<
	Role,
	{ id: number; name: Role; description: string }
> = {
	[Role.ADMIN]: {
		id: 1,
		name: Role.ADMIN,
		description: "Full system access with all permissions",
	},
	[Role.CLIENT_REPRESENTATIVE]: {
		id: 2,
		name: Role.CLIENT_REPRESENTATIVE,
		description:
			"Client-facing representative with order and claims management",
	},
	[Role.AGENT_COMMERCIAL]: {
		id: 3,
		name: Role.AGENT_COMMERCIAL,
		description:
			"Commercial agent with full order lifecycle and customer management",
	},
};

export const PERMISSIONS: Record<
	Permission,
	{ id: number; name: Permission; description: string }
> = {
	// Users: 1-100
	[Permission.USERS_CREATE]: {
		id: 1,
		name: Permission.USERS_CREATE,
		description: "Create new user accounts",
	},
	[Permission.USERS_READ]: {
		id: 2,
		name: Permission.USERS_READ,
		description: "View user account details and lists",
	},
	[Permission.USERS_UPDATE]: {
		id: 3,
		name: Permission.USERS_UPDATE,
		description: "Update existing user account information",
	},
	[Permission.USERS_DELETE]: {
		id: 4,
		name: Permission.USERS_DELETE,
		description: "Delete user accounts from the system",
	},

	// Orders: 101-200
	[Permission.ORDERS_CREATE]: {
		id: 101,
		name: Permission.ORDERS_CREATE,
		description: "Create new orders",
	},
	[Permission.ORDERS_READ]: {
		id: 102,
		name: Permission.ORDERS_READ,
		description: "View order details and lists",
	},
	[Permission.ORDERS_UPDATE]: {
		id: 103,
		name: Permission.ORDERS_UPDATE,
		description: "Modify existing order information",
	},
	[Permission.ORDERS_DELETE]: {
		id: 104,
		name: Permission.ORDERS_DELETE,
		description: "Delete orders from the system",
	},
	[Permission.ORDERS_MANAGE_USER]: {
		id: 105,
		name: Permission.ORDERS_MANAGE_USER,
		description: "Manage order owner",
	},
	[Permission.ORDERS_MANAGE_STATUS]: {
		id: 106,
		name: Permission.ORDERS_MANAGE_STATUS,
		description: "Manage order status",
	},
	[Permission.ORDERS_APPROVE]: {
		id: 107,
		name: Permission.ORDERS_APPROVE,
		description: "Approve orders",
	},
	[Permission.ORDERS_REJECT]: {
		id: 108,
		name: Permission.ORDERS_REJECT,
		description: "Reject orders",
	},
	[Permission.ORDERS_EXECUTE]: {
		id: 109,
		name: Permission.ORDERS_EXECUTE,
		description: "Execute orders (send to DTM)",
	},

	// Customers: 201-300
	[Permission.CUSTOMERS_CREATE]: {
		id: 201,
		name: Permission.CUSTOMERS_CREATE,
		description: "Create new customer profiles",
	},
	[Permission.CUSTOMERS_READ]: {
		id: 202,
		name: Permission.CUSTOMERS_READ,
		description: "View customer profiles and history",
	},
	[Permission.CUSTOMERS_UPDATE]: {
		id: 203,
		name: Permission.CUSTOMERS_UPDATE,
		description: "Update customer profile information",
	},
	[Permission.CUSTOMERS_DELETE]: {
		id: 204,
		name: Permission.CUSTOMERS_DELETE,
		description: "Delete customer profiles from the system",
	},

	// Claims: 301-400
	[Permission.CLAIMS_CREATE]: {
		id: 301,
		name: Permission.CLAIMS_CREATE,
		description: "Create new claims or disputes",
	},
	[Permission.CLAIMS_READ]: {
		id: 302,
		name: Permission.CLAIMS_READ,
		description: "View claim details and lists",
	},
	[Permission.CLAIMS_UPDATE]: {
		id: 303,
		name: Permission.CLAIMS_UPDATE,
		description: "Update claim information and status",
	},
	[Permission.CLAIMS_CLOSE]: {
		id: 304,
		name: Permission.CLAIMS_CLOSE,
		description: "Close resolved claims",
	},
	[Permission.CLAIMS_DELETE]: {
		id: 305,
		name: Permission.CLAIMS_DELETE,
		description: "Delete claims from the system",
	},

	// Tracking: 401-500
	[Permission.TRACKING_READ]: {
		id: 401,
		name: Permission.TRACKING_READ,
		description: "View tracking information and shipment status",
	},
	[Permission.TRACKING_UPDATE]: {
		id: 402,
		name: Permission.TRACKING_UPDATE,
		description: "Update tracking information and shipment details",
	},

	// Reports: 501-600
	[Permission.REPORTS_READ]: {
		id: 501,
		name: Permission.REPORTS_READ,
		description: "View reports and analytics data",
	},
	[Permission.REPORTS_EXPORT]: {
		id: 502,
		name: Permission.REPORTS_EXPORT,
		description: "Export reports to various formats (PDF, Excel, CSV)",
	},

	// System: 601-700
	[Permission.ROLES_MANAGE]: {
		id: 601,
		name: Permission.ROLES_MANAGE,
		description: "Manage roles and their assigned permissions",
	},
	[Permission.PERMISSIONS_MANAGE]: {
		id: 602,
		name: Permission.PERMISSIONS_MANAGE,
		description: "Manage permissions and their definitions",
	},

	// Audit: 701-800
	[Permission.LOGS_READ]: {
		id: 701,
		name: Permission.LOGS_READ,
		description: "View system audit logs and activity history",
	},

	// Profile: 801-900
	[Permission.PROFILE_UPDATE]: {
		id: 801,
		name: Permission.PROFILE_UPDATE,
		description: "Update user profile and account preferences",
	},

	// Archival: 901-1000
	[Permission.ARCHIVAL_MANAGE]: {
		id: 901,
		name: Permission.ARCHIVAL_MANAGE,
		description: "Manage data archival, retention, and purging policies",
	},
	[Permission.ARCHIVAL_READ]: {
		id: 902,
		name: Permission.ARCHIVAL_READ,
		description: "View archived data and historical records",
	},

	// Programs: 1001-1100
	[Permission.PROGRAMS_CREATE]: {
		id: 1001,
		name: Permission.PROGRAMS_CREATE,
		description: "Create new programs or initiatives",
	},
	[Permission.PROGRAMS_READ]: {
		id: 1002,
		name: Permission.PROGRAMS_READ,
		description: "View program details and lists",
	},
	[Permission.PROGRAMS_APPROVE]: {
		id: 1003,
		name: Permission.PROGRAMS_APPROVE,
		description: "Approve programs for implementation",
	},
	[Permission.PROGRAMS_SEND]: {
		id: 1004,
		name: Permission.PROGRAMS_SEND,
		description: "Submit programs for review or approval",
	},
	[Permission.PROGRAMS_EXECUTE]: {
		id: 1005,
		name: Permission.PROGRAMS_EXECUTE,
		description: "Execute approved programs",
	},
	[Permission.PROGRAMS_UPDATE]: {
		id: 1006,
		name: Permission.PROGRAMS_UPDATE,
		description: "Update program details and parameters",
	},
	[Permission.PROGRAMS_DELETE]: {
		id: 1007,
		name: Permission.PROGRAMS_DELETE,
		description: "Delete programs from the system",
	},
};

export const ROLE_PERMISSIONS: Record<Role, Permission[] | "ALL"> = {
	[Role.ADMIN]: "ALL",

	[Role.CLIENT_REPRESENTATIVE]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
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
		Permission.ORDERS_MANAGE_USER,
		Permission.ORDERS_MANAGE_STATUS,
		Permission.ORDERS_APPROVE,
		Permission.ORDERS_REJECT,
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
