import assert from "node:assert/strict";
import { RegistrationStatus, Role } from "@ecommand/shared";
import type { UserListDto } from "../src/lib/api/generated.schemas";
import { filterUsers, parseUserRoleFilter } from "../src/lib/user-filters";

function createUser(
	id: number,
	values: Partial<UserListDto> = {},
): UserListDto {
	return {
		id,
		firstName: id === 1 ? "Pending" : "Active",
		lastName: "Representative",
		email: `user${id}@example.test`,
		employeeCode: id === 3 ? "EMP-003" : null,
		type: "external",
		roleId: Role.CLIENT_REPRESENTATIVE,
		role: { id: Role.CLIENT_REPRESENTATIVE, name: Role.CLIENT_REPRESENTATIVE },
		registrationStatus:
			id === 1 ? RegistrationStatus.PENDING : RegistrationStatus.APPROVED,
		customerId: 1,
		userCustomers: [],
		agencyId: null,
		createdAt: "2026-09-30T00:00:00.000Z",
		updatedAt: "2026-09-30T00:00:00.000Z",
		isActive: id !== 1,
		lastLogin: null,
		...values,
	};
}

const users = [
	createUser(1),
	createUser(2),
	createUser(3, {
		roleId: Role.AGENT_COMMERCIAL,
		role: { id: Role.AGENT_COMMERCIAL, name: Role.AGENT_COMMERCIAL },
	}),
];

assert.deepEqual(
	filterUsers(users, { registrationStatus: RegistrationStatus.PENDING }).map(
		(user) => user.id,
	),
	[1],
	"registration-review filtering shows pending accounts only",
);
assert.deepEqual(
	filterUsers(users, {
		registrationStatus: RegistrationStatus.PENDING,
		role: Role.CLIENT_REPRESENTATIVE,
		activeStatus: "INACTIVE",
	}).map((user) => user.id),
	[1],
	"combined filters support the dashboard review queue link",
);
assert.deepEqual(
	filterUsers(users, { role: Role.AGENT_COMMERCIAL }).map((user) => user.id),
	[3],
	"role filters distinguish user groups",
);
assert.deepEqual(
	filterUsers(
		[
			...users,
			createUser(4, {
				roleId: "role-regional-operations",
				role: { id: "role-regional-operations", name: "Regional Operations" },
			}),
		],
		{ role: "Regional Operations" },
	).map((user) => user.id),
	[4],
	"custom access profiles can be selected in the role filter",
);
assert.equal(
	parseUserRoleFilter("Regional Operations"),
	"Regional Operations",
	"custom access profile filters survive query parsing",
);
assert.equal(
	parseUserRoleFilter(["CLIENT_REPRESENTATIVE", "AGENT_COMMERCIAL"]),
	undefined,
	"ambiguous repeated role filters are ignored",
);
assert.deepEqual(
	filterUsers(users, { activeStatus: "ACTIVE" }).map((user) => user.id),
	[2, 3],
	"active account filter excludes pending inactive accounts",
);
assert.deepEqual(
	filterUsers(users, { search: "EMP-003" }).map((user) => user.id),
	[3],
	"search supports employee codes",
);

console.log("User list filter checks passed.");
