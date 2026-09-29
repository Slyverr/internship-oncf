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
	getPendingClientRegistrations,
	hasAvailableActions,
} from "../src/lib/action-visibility";
import type { UserListDto } from "../src/lib/api/generated.schemas";
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
