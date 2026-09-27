import assert from "node:assert/strict";
import {
	DEFAULT_ROLE_PERMISSIONS,
	hasOnePermission,
	OrderStatus,
	Permission,
	ProgramStatus,
	RegistrationStatus,
	Role,
} from "@ecommand/shared";
import {
	canDeleteProgram,
	canReviewRegistration,
	getDashboardQuickActions,
	hasAvailableActions,
} from "../src/lib/action-visibility";
import { canCreateProgramForOrder } from "../src/lib/program-creation-eligibility";

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

function roleHasPermission(role: Role, permission: Permission): boolean {
	const permissions = DEFAULT_ROLE_PERMISSIONS[role];

	return (
		permissions === "ALL" || hasOnePermission(new Set(permissions), permission)
	);
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
		[
			{
				type: "order",
				label: "Create order",
				href: "/dashboard/orders/new",
			},
			{
				type: "claim",
				label: "Create claim",
				href: "/dashboard/claims/new",
			},
		],
		`${role} gets quick actions for workflows granted by its default permissions`,
	);
}
assert.deepEqual(
	getDashboardQuickActions(
		(permission) => permission === Permission.CLAIMS_CREATE,
	),
	[
		{
			type: "claim",
			label: "Create claim",
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
assert.equal(
	hasAvailableActions(
		roleHasPermission(Role.ADMIN, Permission.CUSTOMERS_DELETE),
	),
	true,
	"administrators get the customer actions menu when deactivation is available",
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
	true,
	"administrators may delete a program while it is Draft",
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
	true,
	"administrators can create programs from eligible orders across owners",
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
