import { Permission, Role } from "@ecommand/shared";
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

type PermissionDefinition = {
	description: string;
	parent?: Permission;
};

const PERMISSION_DEFINITIONS: Partial<
	Record<Permission, PermissionDefinition>
> = {
	[Permission.USERS_CREATE]: {
		description: "Create new user accounts",
		parent: Permission.USERS_MANAGE,
	},
	[Permission.USERS_READ]: {
		description: "View user account details and lists",
		parent: Permission.USERS_MANAGE,
	},
	[Permission.USERS_UPDATE]: {
		description: "Update existing user account information",
		parent: Permission.USERS_MANAGE,
	},
	[Permission.USERS_DELETE]: {
		description: "Delete user accounts from the system",
		parent: Permission.USERS_MANAGE,
	},
	[Permission.USERS_MANAGE]: {
		description: "Manage user operations",
	},
	[Permission.USERS_MANAGE_OTHER]: {
		description: "Manage users belonging to other accounts",
	},

	[Permission.ORDERS_CREATE]: {
		description: "Create new orders",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_READ]: {
		description: "View order details and lists",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_UPDATE]: {
		description: "Modify existing order information",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_DELETE]: {
		description: "Delete orders from the system",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_MANAGE]: {
		description: "Manage all order operations",
	},
	[Permission.ORDERS_MANAGE_OTHER]: {
		description: "Manage orders belonging to other users",
	},
	[Permission.ORDERS_MANAGE_OWNERSHIP]: {
		description: "Change order ownership and assignment",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_STATUS_UPDATE]: {
		description: "Update order status according to workflow rules",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_APPROVE]: {
		description: "Approve orders",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_REJECT]: {
		description: "Reject orders",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_EXECUTE]: {
		description: "Execute orders",
		parent: Permission.ORDERS_MANAGE,
	},
	[Permission.ORDERS_SEND]: {
		description: "Send orders for processing",
		parent: Permission.ORDERS_MANAGE,
	},

	[Permission.CUSTOMERS_CREATE]: {
		description: "Create new customer profiles",
		parent: Permission.CUSTOMERS_MANAGE,
	},
	[Permission.CUSTOMERS_READ]: {
		description: "View customer profiles and history",
		parent: Permission.CUSTOMERS_MANAGE,
	},
	[Permission.CUSTOMERS_UPDATE]: {
		description: "Update customer profile information",
		parent: Permission.CUSTOMERS_MANAGE,
	},
	[Permission.CUSTOMERS_DELETE]: {
		description: "Delete customer profiles from the system",
		parent: Permission.CUSTOMERS_MANAGE,
	},
	[Permission.CUSTOMERS_MANAGE]: {
		description: "Manage customer operations",
	},
	[Permission.CUSTOMERS_MANAGE_OTHER]: {
		description: "Manage customers belonging to other users",
	},

	[Permission.CLAIMS_CREATE]: {
		description: "Create new claims or disputes",
		parent: Permission.CLAIMS_MANAGE,
	},
	[Permission.CLAIMS_READ]: {
		description: "View claim details and lists",
		parent: Permission.CLAIMS_MANAGE,
	},
	[Permission.CLAIMS_UPDATE]: {
		description: "Update claim information",
		parent: Permission.CLAIMS_MANAGE,
	},
	[Permission.CLAIMS_DELETE]: {
		description: "Delete claims from the system",
		parent: Permission.CLAIMS_MANAGE,
	},
	[Permission.CLAIMS_MANAGE]: {
		description: "Manage all claims",
	},
	[Permission.CLAIMS_MANAGE_OTHER]: {
		description: "Manage claims belonging to other users",
	},
	[Permission.CLAIMS_STATUS_UPDATE]: {
		description: "Update claim status according to workflow rules",
		parent: Permission.CLAIMS_MANAGE,
	},
	[Permission.CLAIMS_CLOSE]: {
		description: "Close resolved claims",
		parent: Permission.CLAIMS_MANAGE,
	},

	[Permission.TRACKING_READ]: {
		description: "View tracking information and shipment status",
		parent: Permission.TRACKING_MANAGE,
	},
	[Permission.TRACKING_UPDATE]: {
		description: "Update tracking information and shipment details",
		parent: Permission.TRACKING_MANAGE,
	},
	[Permission.TRACKING_MANAGE]: {
		description: "Manage tracking operations",
	},

	[Permission.REPORTS_READ]: {
		description: "View reports and analytics data",
	},
	[Permission.REPORTS_EXPORT]: {
		description: "Export reports to various formats (PDF, Excel, CSV)",
	},

	[Permission.ROLES_MANAGE]: {
		description: "Manage roles and their assigned permissions",
	},
	[Permission.PERMISSIONS_MANAGE]: {
		description: "Manage permissions and their definitions",
	},

	[Permission.LOGS_READ]: {
		description: "View system audit logs and activity history",
	},

	[Permission.PROFILE_UPDATE]: {
		description: "Update user profile and account preferences",
	},

	[Permission.ARCHIVAL_MANAGE]: {
		description: "Manage data archival, retention, and purging policies",
	},
	[Permission.ARCHIVAL_READ]: {
		description: "View archived data and historical records",
		parent: Permission.ARCHIVAL_MANAGE,
	},

	[Permission.PROGRAMS_CREATE]: {
		description: "Create new programs",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_READ]: {
		description: "View program details and lists",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_UPDATE]: {
		description: "Update program information",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_DELETE]: {
		description: "Delete programs",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_MANAGE]: {
		description: "Manage program operations",
	},
	[Permission.PROGRAMS_MANAGE_OTHER]: {
		description: "Manage programs belonging to other users",
	},
	[Permission.PROGRAMS_STATUS_UPDATE]: {
		description: "Update program status according to workflow rules",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_APPROVE]: {
		description: "Approve programs",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_SEND]: {
		description: "Send programs for processing",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_EXECUTE]: {
		description: "Execute programs",
		parent: Permission.PROGRAMS_MANAGE,
	},
	[Permission.PROGRAMS_MANAGE_OWNERSHIP]: {
		description: "Change program ownership and assignment",
		parent: Permission.PROGRAMS_MANAGE,
	},
};

export const PERMISSIONS = createReferenceMap(
	PERMISSION_DEFINITIONS,
	(name, { description, parent }) => ({
		id: createReferenceId("permissions", name),
		name,
		description,
		parentId: parent ? createReferenceId("permissions", parent) : undefined,
	}),
);

export const PERMISSION_PARENTS: Partial<Record<Permission, Permission>> =
	Object.fromEntries(
		Object.entries(PERMISSION_DEFINITIONS)
			.filter(([, definition]) => definition.parent)
			.map(([permission, definition]) => [permission, definition.parent]),
	);

export const ROLE_PERMISSIONS: Record<Role, Permission[] | "ALL"> = {
	[Role.ADMIN]: "ALL",

	[Role.CLIENT_REPRESENTATIVE]: [
		Permission.ORDERS_CREATE,
		Permission.ORDERS_READ,
		Permission.ORDERS_UPDATE,
		Permission.ORDERS_DELETE,

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
		Permission.ORDERS_STATUS_UPDATE,
		Permission.ORDERS_APPROVE,
		Permission.ORDERS_REJECT,
		Permission.ORDERS_SEND,
		Permission.ORDERS_EXECUTE,
		Permission.ORDERS_MANAGE_OTHER,

		Permission.CUSTOMERS_READ,
		Permission.CUSTOMERS_UPDATE,

		Permission.CLAIMS_CREATE,
		Permission.CLAIMS_READ,
		Permission.CLAIMS_UPDATE,
		Permission.CLAIMS_STATUS_UPDATE,
		Permission.CLAIMS_CLOSE,

		Permission.TRACKING_READ,

		Permission.REPORTS_READ,
		Permission.PROFILE_UPDATE,

		Permission.PROGRAMS_CREATE,
		Permission.PROGRAMS_READ,
		Permission.PROGRAMS_UPDATE,
		Permission.PROGRAMS_STATUS_UPDATE,
		Permission.PROGRAMS_APPROVE,
		Permission.PROGRAMS_SEND,
		Permission.PROGRAMS_EXECUTE,
	],
};
