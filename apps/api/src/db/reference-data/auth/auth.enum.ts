export enum Role {
	ADMIN = "ADMIN",
	CLIENT_REPRESENTATIVE = "CLIENT_REPRESENTATIVE",
	AGENT_COMMERCIAL = "AGENT_COMMERCIAL",
}

export enum Permission {
	USERS_CREATE = "users:create",
	USERS_READ = "users:read",
	USERS_UPDATE = "users:update",
	USERS_DELETE = "users:delete",

	ORDERS_CREATE = "orders:create",
	ORDERS_READ = "orders:read",
	ORDERS_UPDATE = "orders:update",
	ORDERS_DELETE = "orders:delete",
	ORDERS_APPROVE = "orders:approve",
	ORDERS_REJECT = "orders:reject",
	ORDERS_EXECUTE = "orders:execute",

	CUSTOMERS_CREATE = "customers:create",
	CUSTOMERS_READ = "customers:read",
	CUSTOMERS_UPDATE = "customers:update",
	CUSTOMERS_DELETE = "customers:delete",

	CLAIMS_CREATE = "claims:create",
	CLAIMS_READ = "claims:read",
	CLAIMS_UPDATE = "claims:update",
	CLAIMS_CLOSE = "claims:close",
	CLAIMS_DELETE = "claims:delete",

	TRACKING_READ = "tracking:read",
	TRACKING_UPDATE = "tracking:update",

	REPORTS_READ = "reports:read",
	REPORTS_EXPORT = "reports:export",

	ROLES_MANAGE = "roles:manage",
	PERMISSIONS_MANAGE = "permissions:manage",

	LOGS_READ = "logs:read",

	PROFILE_UPDATE = "profile:update",

	ARCHIVAL_MANAGE = "archival:manage",
	ARCHIVAL_READ = "archival:read",

	PROGRAMS_CREATE = "programs:create",
	PROGRAMS_READ = "programs:read",
	PROGRAMS_APPROVE = "programs:approve",
	PROGRAMS_SEND = "programs:send",
	PROGRAMS_EXECUTE = "programs:execute",
	PROGRAMS_UPDATE = "programs:update",
	PROGRAMS_DELETE = "programs:delete",
}
