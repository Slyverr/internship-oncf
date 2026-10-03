import assert from "node:assert/strict";
import {
	CATALOG_MANAGEMENT_REQUIREMENTS,
	DEFAULT_ROLE_PERMISSIONS,
	hasOnePermission,
	isWorkflowTransitionAllowed,
	ORDER_TRANSITIONS,
	OrderStatus,
	Permission,
	ProgramStatus,
	RegistrationStatus,
	Role,
} from "@ecommand/shared";
import {
	getVisibleSidebarRoutes,
	sidebarRoutes,
} from "../src/components/sidebar/sidebar-routes";
import {
	canDeleteProgram,
	canReviewRegistration,
	canSubmitRequiredText,
	getDashboardQuickActions,
	getPendingClientRegistrations,
	getUserAccountOverview,
	hasAvailableActions,
} from "../src/lib/action-visibility";
import type { UserListDto } from "../src/lib/api/generated.schemas";
import { canCreateProgramForOrder } from "../src/lib/program-creation-eligibility";

const referenceDataRoute = sidebarRoutes.find(
	(route) => route.url === "/dashboard/catalog",
);
assert.deepEqual(
	referenceDataRoute?.anyPermissionGroups,
	Object.values(CATALOG_MANAGEMENT_REQUIREMENTS),
	"reference-data navigation uses category-specific access requirements",
);
assert.equal(
	roleHasPermission(Role.ADMIN, Permission.CATALOG_MANAGE),
	true,
	"administrators can see reference-data management from their effective grants",
);
assert.equal(
	roleHasPermission(Role.AGENT_COMMERCIAL, Permission.CATALOG_MANAGE),
	false,
	"commercial agents cannot see reference-data management without the grant",
);
assert.equal(
	roleHasPermission(Role.CLIENT_REPRESENTATIVE, Permission.CATALOG_MANAGE),
	false,
	"client representatives cannot see reference-data management without the grant",
);

assert.equal(
	canReviewRegistration(RegistrationStatus.PENDING, true, true),
	true,
	"administrators with user-update permission can review pending registrations",
);
assert.equal(
	canReviewRegistration(RegistrationStatus.PENDING, false, true),
	false,
	"users without user-update permission cannot review registrations",
);
assert.equal(
	canReviewRegistration(RegistrationStatus.APPROVED, true, true),
	false,
	"approved registrations cannot be reviewed again",
);
assert.equal(
	canReviewRegistration(RegistrationStatus.REJECTED, true, true),
	false,
	"rejected registrations cannot be reviewed again",
);
assert.equal(
	canReviewRegistration(RegistrationStatus.PENDING, true, false),
	false,
	"only client-representative registrations can be reviewed",
);

function registrationUser(
	id: number,
	registrationStatus: RegistrationStatus,
	role: Role,
	createdAt: string,
): UserListDto {
	return {
		id,
		firstName: `Client${id}`,
		lastName: "Representative",
		email: `client${id}@example.test`,
		employeeCode: null,
		type: "external",
		roleId: role,
		role: { id: role, name: role },
		registrationStatus,
		customerId: null,
		userCustomers: [],
		agencyId: null,
		createdAt,
		updatedAt: createdAt,
		isActive: registrationStatus === RegistrationStatus.APPROVED,
		lastLogin: null,
	};
}

const registrationUsers = [
	registrationUser(
		8,
		RegistrationStatus.PENDING,
		Role.CLIENT_REPRESENTATIVE,
		"2026-09-28T10:00:00.000Z",
	),
	registrationUser(
		4,
		RegistrationStatus.PENDING,
		Role.CLIENT_REPRESENTATIVE,
		"2026-09-27T10:00:00.000Z",
	),
	registrationUser(
		12,
		RegistrationStatus.PENDING,
		Role.AGENT_COMMERCIAL,
		"2026-09-26T10:00:00.000Z",
	),
	registrationUser(
		2,
		RegistrationStatus.APPROVED,
		Role.CLIENT_REPRESENTATIVE,
		"2026-09-25T10:00:00.000Z",
	),
];
assert.deepEqual(
	getPendingClientRegistrations(registrationUsers, true).map((user) => user.id),
	[4, 8],
	"the review queue includes pending client accounts oldest first",
);
assert.deepEqual(
	getPendingClientRegistrations(registrationUsers, false),
	[],
	"users without review permissions do not receive pending account details",
);
assert.deepEqual(
	getUserAccountOverview(registrationUsers),
	{ total: 4, active: 1, pending: 3, inactive: 0 },
	"account overview counts disjoint active, pending, and inactive account states",
);

function roleHasPermission(role: Role, permission: Permission): boolean {
	const permissions = DEFAULT_ROLE_PERMISSIONS[role];

	return hasOnePermission(new Set(permissions), permission);
}

for (const role of [
	Role.ADMIN,
	Role.AGENT_COMMERCIAL,
	Role.CLIENT_REPRESENTATIVE,
]) {
	assert.deepEqual(
		getDashboardQuickActions((permission) =>
			roleHasPermission(role, permission),
		),
		role === Role.ADMIN
			? []
			: [
					{
						type: "order",
						href: "/dashboard/orders/new",
					},
					{
						type: "claim",
						href: "/dashboard/claims/new",
					},
				],
		`${role} gets quick actions for workflows granted by its default permissions`,
	);
}

const expectedSidebarRoutes: Record<Role, string[]> = {
	[Role.ADMIN]: [
		"/dashboard",
		"/dashboard/reports",
		"/dashboard/users",
		"/dashboard/roles",
		"/dashboard/catalog",
	],
	[Role.AGENT_COMMERCIAL]: [
		"/dashboard",
		"/dashboard/orders",
		"/dashboard/programs",
		"/dashboard/reports",
		"/dashboard/claims",
		"/dashboard/customers",
	],
	[Role.CLIENT_REPRESENTATIVE]: [
		"/dashboard",
		"/dashboard/orders",
		"/dashboard/programs",
		"/dashboard/reports",
		"/dashboard/claims",
	],
};

for (const role of Object.values(Role)) {
	const permissions = new Set(DEFAULT_ROLE_PERMISSIONS[role]);
	assert.deepEqual(
		getVisibleSidebarRoutes((permission) =>
			hasOnePermission(permissions, permission),
		).map((route) => route.url),
		expectedSidebarRoutes[role],
		`${role} sees only its default permission-backed navigation routes`,
	);
}

assert.deepEqual(
	getVisibleSidebarRoutes((permission) =>
		[Permission.CATALOG_READ, Permission.CLAIMS_READ].includes(permission),
	).map((route) => route.url),
	["/dashboard", "/dashboard/claims"],
	"custom permission sets do not gain catalog management from catalog read access",
);
assert.deepEqual(
	getVisibleSidebarRoutes((permission) =>
		[Permission.CATALOG_MANAGE_GOODS, Permission.CATALOG_READ].includes(
			permission,
		),
	).map((route) => route.url),
	["/dashboard", "/dashboard/catalog"],
	"a user with goods management and catalog read can open reference data",
);
assert.equal(
	isWorkflowTransitionAllowed(
		ORDER_TRANSITIONS,
		OrderStatus.SUBMITTED,
		OrderStatus.CANCELLED,
	),
	true,
	"the order UI can show cancellation when the shared workflow permits it",
);
assert.equal(
	isWorkflowTransitionAllowed(
		ORDER_TRANSITIONS,
		OrderStatus.IN_PROGRESS,
		OrderStatus.CANCELLED,
	),
	true,
	"an in-progress order can be cancelled because the API permits it",
);
assert.equal(
	isWorkflowTransitionAllowed(
		ORDER_TRANSITIONS,
		OrderStatus.APPROVED,
		OrderStatus.CANCELLED,
	),
	false,
	"the order UI hides cancellation when the shared workflow disallows it",
);
assert.deepEqual(
	getDashboardQuickActions(
		(permission) => permission === Permission.CLAIMS_CREATE,
	),
	[
		{
			type: "claim",
			href: "/dashboard/claims/new",
		},
	],
	"the dashboard hides quick actions when their create permission is absent",
);

const agentCanEditCustomer = roleHasPermission(
	Role.AGENT_COMMERCIAL,
	Permission.CUSTOMERS_UPDATE,
);
const agentCanDeactivateCustomer = roleHasPermission(
	Role.AGENT_COMMERCIAL,
	Permission.CUSTOMERS_DELETE,
);
assert.equal(
	agentCanEditCustomer,
	true,
	"commercial agents can edit customers",
);
assert.equal(
	hasAvailableActions(agentCanEditCustomer, agentCanDeactivateCustomer),
	true,
	"the customer action component remains visible for an edit action",
);
assert.equal(
	hasAvailableActions(agentCanDeactivateCustomer),
	false,
	"commercial agents do not get an empty customer actions menu",
);
assert.equal(canSubmitRequiredText("   ", false), false);
assert.equal(canSubmitRequiredText("This explains the decision.", false), true);
assert.equal(canSubmitRequiredText("This explains the decision.", true), false);
assert.equal(
	hasAvailableActions(
		roleHasPermission(Role.ADMIN, Permission.CUSTOMERS_DELETE),
	),
	false,
	"administrators do not get customer actions outside their SDF role",
);

const agentCanEditProgram = roleHasPermission(
	Role.AGENT_COMMERCIAL,
	Permission.PROGRAMS_UPDATE,
);
const agentCanDeleteDraftProgram = roleHasPermission(
	Role.AGENT_COMMERCIAL,
	Permission.PROGRAMS_DELETE,
);
assert.equal(
	hasAvailableActions(agentCanEditProgram, agentCanDeleteDraftProgram),
	true,
	"an edit action keeps the program menu available",
);
assert.equal(
	hasAvailableActions(
		false,
		canDeleteProgram(
			ProgramStatus.APPROVED,
			roleHasPermission(Role.ADMIN, Permission.PROGRAMS_DELETE),
		),
	),
	false,
	"a delete-only role does not get an empty menu after Draft",
);
assert.equal(
	canDeleteProgram(
		ProgramStatus.DRAFT,
		roleHasPermission(Role.ADMIN, Permission.PROGRAMS_DELETE),
	),
	false,
	"administrators do not get program actions outside their SDF role",
);
for (const status of Object.values(ProgramStatus)) {
	assert.equal(
		canDeleteProgram(status, true),
		status === ProgramStatus.DRAFT,
		"program deletion availability follows the Draft-only rule",
	);
}

function canCreateProgramForRole(role: Role, orderOwnerId: number) {
	return canCreateProgramForOrder({
		canCreate: roleHasPermission(role, Permission.PROGRAMS_CREATE),
		canManageOther: roleHasPermission(role, Permission.ORDERS_MANAGE_OTHER),
		createdByUserId: orderOwnerId,
		currentUserId: 12,
		orderStatus: OrderStatus.APPROVED,
		programCount: 0,
	});
}

assert.equal(
	canCreateProgramForRole(Role.ADMIN, 99),
	false,
	"administrators cannot create programs outside their SDF role",
);
assert.equal(
	canCreateProgramForRole(Role.AGENT_COMMERCIAL, 99),
	true,
	"commercial agents can create programs from eligible orders in their manage scope",
);
assert.equal(
	canCreateProgramForRole(Role.CLIENT_REPRESENTATIVE, 12),
	false,
	"client representatives cannot create programs even for their own eligible order",
);

console.log("Action visibility role checks passed.");
