import { Permission, Role } from "@ecommand/shared";
import {
	createGroupedReferenceMap,
	createReferenceMap,
} from "./reference-data.utils";

export const ROLES = createReferenceMap("roles", {
	[Role.ADMIN]: "Full system access with all permissions",
	[Role.CLIENT_REPRESENTATIVE]:
		"Client-facing representative with order and claims management",
	[Role.AGENT_COMMERCIAL]:
		"Commercial agent with full order lifecycle and customer management",
});

export const PERMISSIONS = createGroupedReferenceMap("permissions", [
	{
		[Permission.USERS_CREATE]: "Create new user accounts",
		[Permission.USERS_READ]: "View user account details and lists",
		[Permission.USERS_UPDATE]: "Update existing user account information",
		[Permission.USERS_DELETE]: "Delete user accounts from the system",
		[Permission.USERS_MANAGE]: "Manage user operations",
		[Permission.USERS_MANAGE_OTHER]: "Manage users belonging to other accounts",
	},
	{
		[Permission.ORDERS_CREATE]: "Create new orders",
		[Permission.ORDERS_READ]: "View order details and lists",
		[Permission.ORDERS_UPDATE]: "Modify existing order information",
		[Permission.ORDERS_DELETE]: "Delete orders from the system",
		[Permission.ORDERS_MANAGE]: "Manage all order operations",
		[Permission.ORDERS_MANAGE_OTHER]: "Manage orders belonging to other users",
		[Permission.ORDERS_MANAGE_OWNERSHIP]:
			"Change order ownership and assignment",
		[Permission.ORDERS_STATUS_UPDATE]:
			"Update order status according to workflow rules",
		[Permission.ORDERS_APPROVE]: "Approve orders",
		[Permission.ORDERS_REJECT]: "Reject orders",
		[Permission.ORDERS_EXECUTE]: "Execute orders",
		[Permission.ORDERS_SEND]: "Send orders for processing",
	},
	{
		[Permission.CUSTOMERS_CREATE]: "Create new customer profiles",
		[Permission.CUSTOMERS_READ]: "View customer profiles and history",
		[Permission.CUSTOMERS_UPDATE]: "Update customer profile information",
		[Permission.CUSTOMERS_DELETE]: "Delete customer profiles from the system",
		[Permission.CUSTOMERS_MANAGE]: "Manage customer operations",
		[Permission.CUSTOMERS_MANAGE_OTHER]:
			"Manage customers belonging to other users",
	},
	{
		[Permission.CLAIMS_CREATE]: "Create new claims or disputes",
		[Permission.CLAIMS_READ]: "View claim details and lists",
		[Permission.CLAIMS_UPDATE]: "Update claim information",
		[Permission.CLAIMS_CLOSE]: "Close resolved claims",
		[Permission.CLAIMS_DELETE]: "Delete claims from the system",
		[Permission.CLAIMS_MANAGE]: "Manage all claims",
		[Permission.CLAIMS_MANAGE_OTHER]: "Manage claims belonging to other users",
		[Permission.CLAIMS_STATUS_UPDATE]:
			"Update claim status according to workflow rules",
	},
	{
		[Permission.TRACKING_READ]: "View tracking information and shipment status",
		[Permission.TRACKING_UPDATE]:
			"Update tracking information and shipment details",
		[Permission.TRACKING_MANAGE]: "Manage tracking operations",
	},
	{
		[Permission.REPORTS_READ]: "View reports and analytics data",
		[Permission.REPORTS_EXPORT]:
			"Export reports to various formats (PDF, Excel, CSV)",
	},
	{
		[Permission.ROLES_MANAGE]: "Manage roles and their assigned permissions",
		[Permission.PERMISSIONS_MANAGE]: "Manage permissions and their definitions",
	},
	{
		[Permission.LOGS_READ]: "View system audit logs and activity history",
	},
	{
		[Permission.PROFILE_UPDATE]: "Update user profile and account preferences",
	},
	{
		[Permission.ARCHIVAL_MANAGE]:
			"Manage data archival, retention, and purging policies",
		[Permission.ARCHIVAL_READ]: "View archived data and historical records",
	},
	{
		[Permission.PROGRAMS_CREATE]: "Create new programs",
		[Permission.PROGRAMS_READ]: "View program details and lists",
		[Permission.PROGRAMS_UPDATE]: "Update program information",
		[Permission.PROGRAMS_DELETE]: "Delete programs",
		[Permission.PROGRAMS_MANAGE]: "Manage program operations",
		[Permission.PROGRAMS_MANAGE_OTHER]:
			"Manage programs belonging to other users",
		[Permission.PROGRAMS_STATUS_UPDATE]:
			"Update program status according to workflow rules",
		[Permission.PROGRAMS_APPROVE]: "Approve programs",
		[Permission.PROGRAMS_SEND]: "Send programs for processing",
		[Permission.PROGRAMS_EXECUTE]: "Execute programs",
		[Permission.PROGRAMS_MANAGE_OWNERSHIP]:
			"Change program ownership and assignment",
	},
]);

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
