import { Permission } from "../enums/auth.enum";

/** Permissions currently supported by service credentials and integration routes. */
export const INTEGRATION_CREDENTIAL_PERMISSIONS = [
	Permission.TRACKING_UPDATE,
] as const;

export type PermissionDefinition = {
	parent?: Permission;
	assignable?: boolean;
};

export const CATALOG_MANAGEMENT_REQUIREMENTS = {
	units: [Permission.CATALOG_MANAGE_UNITS],
	goodsTypes: [Permission.CATALOG_MANAGE_GOODS_TYPES],
	goods: [Permission.CATALOG_MANAGE_GOODS, Permission.CATALOG_READ],
	accessoryOperations: [Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS],
	rejectionReasons: [Permission.CATALOG_MANAGE_REJECTION_REASONS],
	stations: [Permission.CATALOG_MANAGE_STATIONS],
	agencies: [Permission.CATALOG_MANAGE_AGENCIES],
	ports: [Permission.CATALOG_MANAGE_PORTS],
	berths: [Permission.CATALOG_MANAGE_BERTHS],
	sidings: [Permission.CATALOG_MANAGE_SIDINGS],
	vessels: [Permission.CATALOG_MANAGE_VESSELS],
	shippingCompanies: [Permission.CATALOG_MANAGE_SHIPPING_COMPANIES],
} as const;

export const PERMISSION_DEFINITIONS: Record<Permission, PermissionDefinition> =
	{
		[Permission.USERS_CREATE]: {},
		[Permission.USERS_READ]: {},
		[Permission.USERS_UPDATE]: {},
		[Permission.USERS_DELETE]: {},
		[Permission.USERS_MANAGE]: {},
		[Permission.USERS_MANAGE_OTHER]: {},

		[Permission.ORDERS_CREATE]: {},
		[Permission.ORDERS_READ]: {},
		[Permission.ORDERS_UPDATE]: {},
		[Permission.ORDERS_DELETE]: {},
		[Permission.ORDERS_MANAGE]: {},
		[Permission.ORDERS_MANAGE_OTHER]: {},
		[Permission.ORDERS_MANAGE_OWNERSHIP]: {
			parent: Permission.ORDERS_MANAGE,
		},
		[Permission.ORDERS_MANAGE_STATUS]: {
			parent: Permission.ORDERS_MANAGE,
		},
		[Permission.ORDERS_ACTION]: {},
		[Permission.ORDERS_ACTION_SUBMIT]: {
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_APPROVE]: {
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_REJECT]: {
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_CANCEL]: {
			parent: Permission.ORDERS_ACTION,
		},
		[Permission.ORDERS_ACTION_SEND_TO_DTM]: {
			parent: Permission.ORDERS_ACTION,
		},

		[Permission.CUSTOMERS_CREATE]: {},
		[Permission.CUSTOMERS_READ]: {},
		[Permission.CUSTOMERS_UPDATE]: {},
		[Permission.CUSTOMERS_DELETE]: {},
		[Permission.CUSTOMERS_MANAGE]: {},
		[Permission.CUSTOMERS_MANAGE_OTHER]: {},

		[Permission.PROGRAMS_CREATE]: {},
		[Permission.PROGRAMS_READ]: {},
		[Permission.PROGRAMS_UPDATE]: {},
		[Permission.PROGRAMS_DELETE]: {},
		[Permission.PROGRAMS_MANAGE]: {},
		[Permission.PROGRAMS_MANAGE_OTHER]: {},
		[Permission.PROGRAMS_MANAGE_OWNERSHIP]: {
			parent: Permission.PROGRAMS_MANAGE,
		},
		[Permission.PROGRAMS_MANAGE_STATUS]: {
			parent: Permission.PROGRAMS_MANAGE,
		},
		[Permission.PROGRAMS_ACTION]: {},
		[Permission.PROGRAMS_ACTION_SUBMIT]: {
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_APPROVE]: {
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_CONFIRM]: {
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_CANCEL]: {
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_SEND]: {
			parent: Permission.PROGRAMS_ACTION,
		},
		[Permission.PROGRAMS_ACTION_EXECUTE]: {
			assignable: false,
			parent: Permission.PROGRAMS_ACTION,
		},

		[Permission.CLAIMS_CREATE]: {},
		[Permission.CLAIMS_READ]: {},
		[Permission.CLAIMS_UPDATE]: {},
		[Permission.CLAIMS_DELETE]: {},
		[Permission.CLAIMS_MANAGE]: {},
		[Permission.CLAIMS_MANAGE_OTHER]: {},
		[Permission.CLAIMS_MANAGE_STATUS]: {
			parent: Permission.CLAIMS_MANAGE,
		},
		[Permission.CLAIMS_ACTION]: {},
		[Permission.CLAIMS_ACTION_COMMENT]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_START_PROGRESS]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_AWAIT_INFO]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_START_TREATMENT]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_RESOLVE]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_REJECT]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_SEND_TO_DTM]: {
			parent: Permission.CLAIMS_ACTION,
		},
		[Permission.CLAIMS_ACTION_CLOSE]: {
			parent: Permission.CLAIMS_ACTION,
		},

		[Permission.CATALOG_READ]: {},
		[Permission.CATALOG_MANAGE]: {},
		[Permission.CATALOG_MANAGE_UNITS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_GOODS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_GOODS_TYPES]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_REJECTION_REASONS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_STATIONS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_AGENCIES]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_PORTS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_BERTHS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_SIDINGS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_VESSELS]: {
			parent: Permission.CATALOG_MANAGE,
		},
		[Permission.CATALOG_MANAGE_SHIPPING_COMPANIES]: {
			parent: Permission.CATALOG_MANAGE,
		},

		[Permission.TRACKING_READ]: {},
		[Permission.TRACKING_UPDATE]: {},
		[Permission.TRACKING_MANAGE]: {
			assignable: false,
		},

		[Permission.REPORTS_READ]: {},
		[Permission.REPORTS_MANAGE_OTHER]: {},
		[Permission.REPORTS_ACTION]: {},
		[Permission.REPORTS_ACTION_EXPORT]: {
			parent: Permission.REPORTS_ACTION,
		},

		[Permission.ROLES_MANAGE]: {},
		[Permission.INTEGRATIONS_MANAGE]: {
			assignable: false,
		},
		[Permission.PERMISSIONS_MANAGE]: {},

		[Permission.LOGS_READ]: {
			assignable: false,
		},

		[Permission.PROFILE_UPDATE]: {},

		[Permission.ARCHIVAL_READ]: {
			assignable: false,
		},
		[Permission.ARCHIVAL_MANAGE]: {
			assignable: false,
		},
	};
