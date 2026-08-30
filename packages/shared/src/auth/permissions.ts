import { Permission } from "../enums/auth.enum";

export type PermissionDefinition = {
	description: string;
	parent?: Permission;
};

export const PERMISSION_DEFINITIONS: Record<Permission, PermissionDefinition> =
	{
		[Permission.USERS_CREATE]: {
			description: "Create new user accounts",
		},
		[Permission.USERS_READ]: {
			description: "View user account details and lists",
		},
		[Permission.USERS_UPDATE]: {
			description: "Update existing user account information",
		},
		[Permission.USERS_DELETE]: {
			description: "Delete user accounts from the system",
		},
		[Permission.USERS_MANAGE]: {
			description: "Manage user operations",
		},
		[Permission.USERS_MANAGE_OTHER]: {
			description: "Manage users belonging to other accounts",
		},

		[Permission.ORDERS_CREATE]: {
			description: "Create new orders",
		},
		[Permission.ORDERS_READ]: {
			description: "View order details and lists",
		},
		[Permission.ORDERS_UPDATE]: {
			description: "Modify existing order information",
		},
		[Permission.ORDERS_DELETE]: {
			description: "Delete orders from the system",
		},
		[Permission.ORDERS_MANAGE]: {
			description: "Manage order properties and settings",
		},
		[Permission.ORDERS_MANAGE_OTHER]: {
			description: "Manage orders belonging to other users",
		},
		[Permission.ORDERS_MANAGE_OWNERSHIP]: {
			description: "Change order ownership and assignment",
			parent: Permission.ORDERS_MANAGE,
		},
		[Permission.ORDERS_MANAGE_STATUS]: {
			description: "Change order status",
			parent: Permission.ORDERS_MANAGE,
		},
		[Permission.ORDERS_ACTION]: {
			description: "Perform order actions",
		},
		[Permission.ORDERS_ACTION_SUBMIT]: {
			description: "Submit orders for processing",
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_APPROVE]: {
			description: "Approve orders",
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_REJECT]: {
			description: "Reject orders",
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_CANCEL]: {
			description: "Cancel orders",
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_SEND_TO_DTM]: {
			description: "Send orders to DTM for processing",
			parent: Permission.ORDERS_ACTION,
		},

		[Permission.CUSTOMERS_CREATE]: {
			description: "Create new customer profiles",
		},
		[Permission.CUSTOMERS_READ]: {
			description: "View customer profiles and history",
		},
		[Permission.CUSTOMERS_UPDATE]: {
			description: "Update customer profile information",
		},
		[Permission.CUSTOMERS_DELETE]: {
			description: "Delete customer profiles from the system",
		},
		[Permission.CUSTOMERS_MANAGE]: {
			description: "Manage customer properties and settings",
		},
		[Permission.CUSTOMERS_MANAGE_OTHER]: {
			description: "Manage customers belonging to other users",
		},

		[Permission.PROGRAMS_CREATE]: {
			description: "Create new programs",
		},
		[Permission.PROGRAMS_READ]: {
			description: "View program details and lists",
		},
		[Permission.PROGRAMS_UPDATE]: {
			description: "Update program information",
		},
		[Permission.PROGRAMS_DELETE]: {
			description: "Delete programs",
		},
		[Permission.PROGRAMS_MANAGE]: {
			description: "Manage program properties and settings",
		},
		[Permission.PROGRAMS_MANAGE_OTHER]: {
			description: "Manage programs belonging to other users",
		},
		[Permission.PROGRAMS_MANAGE_OWNERSHIP]: {
			description: "Change program ownership and assignment",
			parent: Permission.PROGRAMS_MANAGE,
		},
		[Permission.PROGRAMS_MANAGE_STATUS]: {
			description: "Change program status",
			parent: Permission.PROGRAMS_MANAGE,
		},
		[Permission.PROGRAMS_ACTION]: {
			description: "Perform program actions",
		},
		[Permission.PROGRAMS_ACTION_SUBMIT]: {
			description: "Submit programs for processing",
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_APPROVE]: {
			description: "Approve programs",
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_CONFIRM]: {
			description: "Confirm programs",
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_CANCEL]: {
			description: "Cancel programs",
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_SEND]: {
			description: "Send programs to DTM for processing",
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_EXECUTE]: {
			description: "Record program execution",
			parent: Permission.PROGRAMS_ACTION,
		},

		[Permission.CLAIMS_CREATE]: {
			description: "Create new claims or disputes",
		},
		[Permission.CLAIMS_READ]: {
			description: "View claim details and lists",
		},
		[Permission.CLAIMS_UPDATE]: {
			description: "Update claim information",
		},
		[Permission.CLAIMS_DELETE]: {
			description: "Delete claims from the system",
		},
		[Permission.CLAIMS_MANAGE]: {
			description: "Manage claim properties and settings",
		},
		[Permission.CLAIMS_MANAGE_OTHER]: {
			description: "Manage claims belonging to other users",
		},
		[Permission.CLAIMS_MANAGE_STATUS]: {
			description: "Change claim status",
			parent: Permission.CLAIMS_MANAGE,
		},
		[Permission.CLAIMS_ACTION]: {
			description: "Perform claim actions",
		},
		[Permission.CLAIMS_ACTION_START_PROGRESS]: {
			description: "Start claim progress",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_AWAIT_INFO]: {
			description: "Put a claim into an awaiting-information state",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_START_TREATMENT]: {
			description: "Start claim treatment",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_RESOLVE]: {
			description: "Resolve a claim",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_REJECT]: {
			description: "Reject a claim",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_SEND_TO_DTM]: {
			description: "Send a claim to DTM for processing",
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_CLOSE]: {
			description: "Close resolved claims",
			parent: Permission.CLAIMS_ACTION,
		},

		[Permission.CATALOG_READ]: {
			description: "View catalog items",
		},
		[Permission.CATALOG_MANAGE]: {
			description: "Manage catalog data",
		},
		[Permission.CATALOG_MANAGE_UNITS]: {
			description: "Manage measurement units",
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_GOODS]: {
			description: "Manage specific goods",
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_GOODS_TYPES]: {
			description: "Manage goods categories",
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS]: {
			description: "Manage accessory operations",
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_REJECTION_REASONS]: {
			description: "Manage rejection reasons",
			parent: Permission.CATALOG_MANAGE,
		},

		[Permission.TRACKING_READ]: {
			description: "View tracking information and shipment status",
		},
		[Permission.TRACKING_UPDATE]: {
			description: "Update tracking information and shipment details",
		},
		[Permission.TRACKING_MANAGE]: {
			description: "Manage tracking properties and settings",
		},

		[Permission.REPORTS_READ]: {
			description: "View reports and analytics data",
		},
		[Permission.REPORTS_ACTION]: {
			description: "Perform report actions",
		},
		[Permission.REPORTS_ACTION_EXPORT]: {
			description: "Export reports to various formats (PDF, Excel, CSV)",
			parent: Permission.REPORTS_ACTION,
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

		[Permission.ARCHIVAL_READ]: {
			description: "View archived data and historical records",
		},
		[Permission.ARCHIVAL_MANAGE]: {
			description: "Manage data archival, retention, and purging policies",
		},
	};
